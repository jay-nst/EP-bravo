import { BUILD_PHOTOS, FLEET } from '@/lib/climate-content';
import s from './climate.module.css';
import { revealDelay } from './useScrollReveal';

const STATUS_CLASS = {
  live: s.statusLive,
  new: s.statusLive,
  planned: '',
} as const;

/** 위성 소개 — 페이지에서 가장 먼저 나오는 섹션 (Muon Space FireSat 발표 페이지 구성 참고) */
export default function SatelliteSection() {
  return (
    <section id="satellites" className={`${s.tile} ${s.tileAlt}`}>
      <div className={s.inner}>
        <div className={s.center} style={{ marginBottom: 64 }} data-reveal="">
          <span className={s.eyebrow}>우리 위성</span>
          <h2 className={s.h2}>위성을 직접 만들고,<br />띄우고, 운용합니다.</h2>
          <p className={`${s.lead} ${s.narrow}`}>
            기후 데이터는 남의 위성을 빌려 쓰면 원하는 날, 원하는 곳을 볼 수 없습니다.
            나라스페이스는 16U 초소형 위성을 설계부터 관제까지 직접 합니다.
          </p>
        </div>

        <div className={s.grid3}>
          {BUILD_PHOTOS.map((p, i) => (
            <figure key={p.src} className={s.photo} data-reveal="" style={revealDelay(i * 120)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} loading="lazy" />
              <figcaption>
                <span className={s.stepTitle}>{p.title}</span>
                <span className={s.body} style={{ fontSize: 15 }}>{p.desc}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <h3 className={s.h3} style={{ marginTop: 96, marginBottom: 24 }} data-reveal="">
          궤도 위의 위성과 다음 위성
        </h3>
        <ol className={s.fleet}>
          {FLEET.map((sat, i) => (
            <li key={sat.id} className={s.fleetRow} data-reveal="" style={revealDelay(i * 80)}>
              <span className={s.fleetLaunch}>{sat.launch}</span>
              <div>
                <span className={s.fleetName}>{sat.name}</span>
                <span className={s.cardMeta} style={{ marginLeft: 10 }}>{sat.type}</span>
                <p className={s.body} style={{ fontSize: 15, marginTop: 4 }}>{sat.desc}</p>
              </div>
              <span className={`${s.status} ${STATUS_CLASS[sat.status]}`}>{sat.statusLabel}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
