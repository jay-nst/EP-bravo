"""
GK-2A AMI FF (Forest Fire) NetCDF → JSON converter.

Downloads the latest FF product from KMA API Hub,
extracts fire detection points filtered to South Korea,
and outputs GeoJSON-compatible JSON to stdout.

Usage: python parse-gk2a-ff.py <authKey> [date]
  - authKey: KMA API Hub authentication key
  - date (optional): yyyymmddHHMM format. Defaults to latest available.

Requires: pip install netCDF4 xarray pyproj
"""

import sys
import json
import os
import tempfile
from datetime import datetime, timedelta, timezone

import numpy as np
import xarray as xr
from pyproj import Transformer

KST = timezone(timedelta(hours=9))
KOREA_BOUNDS = {"lat_min": 33.0, "lat_max": 39.0, "lon_min": 124.5, "lon_max": 131.5}
CONFIDENCE_MAP = {7: "low", 8: "mid", 9: "high", 10: "industrial"}


def get_latest_date():
    now = datetime.now(KST)
    rounded = now.replace(minute=(now.minute // 10) * 10, second=0, microsecond=0)
    rounded -= timedelta(minutes=20)
    return rounded.strftime("%Y%m%d%H%M")


def download_ff(auth_key, date_str):
    import urllib.request

    url = (
        f"https://apihub.kma.go.kr/api/typ05/api/GK2A/LE2/FF/KO/data"
        f"?date={date_str}&authKey={auth_key}"
    )
    tmp = os.path.join(tempfile.gettempdir(), f"gk2a_ff_{date_str}.nc")
    urllib.request.urlretrieve(url, tmp)

    if os.path.getsize(tmp) < 1000:
        with open(tmp, "r", errors="ignore") as f:
            content = f.read(500)
        if "error" in content.lower() or "html" in content.lower():
            raise RuntimeError(f"API error: {content[:200]}")
    return tmp


def parse_ff(nc_path, obs_time):
    ds = xr.open_dataset(nc_path)
    dqf = ds["DQF_FF"].values
    proj_var = ds["gk2a_imager_projection"]

    fire_mask = (dqf >= 8) & (dqf <= 10)
    fire_y, fire_x = np.where(fire_mask)

    if len(fire_y) == 0:
        return []

    ul_e = float(proj_var.attrs["upper_left_easting"])
    ul_n = float(proj_var.attrs["upper_left_northing"])
    pixel_size = float(proj_var.attrs["pixel_size"])

    lcc_proj = (
        "+proj=lcc +lat_1=30 +lat_2=60 +lat_0=38 +lon_0=126 "
        "+x_0=0 +y_0=0 +datum=WGS84"
    )
    transformer = Transformer.from_crs(lcc_proj, "EPSG:4326", always_xy=True)

    eastings = ul_e + fire_x * pixel_size + pixel_size / 2
    northings = ul_n - fire_y * pixel_size - pixel_size / 2
    lons, lats = transformer.transform(eastings, northings)

    results = []
    for i in range(len(fire_y)):
        lat, lon = float(lats[i]), float(lons[i])

        if not (
            KOREA_BOUNDS["lat_min"] <= lat <= KOREA_BOUNDS["lat_max"]
            and KOREA_BOUNDS["lon_min"] <= lon <= KOREA_BOUNDS["lon_max"]
        ):
            continue

        conf_val = int(dqf[fire_y[i], fire_x[i]])
        results.append(
            {
                "id": f"gk2a-ff-{i}",
                "lat": round(lat, 5),
                "lng": round(lon, 5),
                "confidence": CONFIDENCE_MAP.get(conf_val, "unknown"),
                "confidence_code": conf_val,
                "observedAt": obs_time,
            }
        )

    ds.close()
    return results


def get_candidate_dates(count=12):
    """Return recent 10-min interval timestamps in UTC, going back progressively."""
    now = datetime.now(timezone.utc)
    rounded = now.replace(minute=(now.minute // 10) * 10, second=0, microsecond=0)
    candidates = []
    for i in range(1, count + 1):
        t = rounded - timedelta(minutes=i * 10)
        candidates.append(t.strftime("%Y%m%d%H%M"))
    return candidates


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: parse-gk2a-ff.py <authKey> [date]"}))
        sys.exit(1)

    auth_key = sys.argv[1]

    if len(sys.argv) > 2:
        dates_to_try = [sys.argv[2]]
    else:
        dates_to_try = get_candidate_dates()

    last_error = None
    for date_str in dates_to_try:
        obs_time = (
            f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
            f"T{date_str[8:10]}:{date_str[10:12]}:00"
        )
        try:
            nc_path = download_ff(auth_key, date_str)
            detections = parse_ff(nc_path, obs_time)

            output = {
                "source": "GK2A-AMI-FF",
                "observationTime": obs_time,
                "dateRequested": date_str,
                "totalDetections": len(detections),
                "detections": detections,
            }
            print(json.dumps(output))

            try:
                os.remove(nc_path)
            except OSError:
                pass
            return

        except Exception as e:
            last_error = str(e)
            continue

    print(json.dumps({"error": last_error, "triedDates": dates_to_try}))
    sys.exit(1)


if __name__ == "__main__":
    main()
