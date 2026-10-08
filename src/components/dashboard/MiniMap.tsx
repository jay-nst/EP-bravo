'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const EVENTS = [
  { lng: 129.3, lat: 35.5, color: '#1bbfa8', label: '울산 메탄' },
  { lng: 126.1, lat: 37.4, color: '#C45C4A', label: '수도권 대기' },
  { lng: 128.6, lat: 35.9, color: '#1bbfa8', label: '경주 위성촬영' },
];

export default function MiniMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [127.5, 36.5],
      zoom: 5.2,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    map.on('load', () => {
      EVENTS.forEach((evt) => {
        const el = document.createElement('div');
        el.style.cssText = `
          width: 8px; height: 8px; border-radius: 50%;
          background: ${evt.color};
          box-shadow: 0 0 6px ${evt.color}80;
          animation: minimap-pulse 2s ease-in-out infinite;
        `;
        new mapboxgl.Marker({ element: el })
          .setLngLat([evt.lng, evt.lat])
          .addTo(map);
      });
      setReady(true);
    });

    mapRef.current = map;

    return () => { map.remove(); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes minimap-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        .minimap-container .mapboxgl-canvas { border-radius: 8px; }
      `}</style>
      <div className="minimap-container relative h-120 overflow-hidden rounded-sm bg-bg-secondary">
        <div ref={containerRef} className="h-full w-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-body-xs-regular text-text-tertiary">loading...</span>
          </div>
        )}
        <div className="absolute top-8 left-8 text-body-xs-regular text-text-tertiary tabular-nums [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          36.5°N 127.5°E
        </div>
      </div>
    </>
  );
}
