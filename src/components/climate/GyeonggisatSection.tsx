'use client';

import { GG2A_LAUNCH_KST, GG2A_NOTES, GG2A_SPECS, LAUNCH_SEQUENCE } from '@/lib/climate-content';
import s from './climate.module.css';
import { revealDelay } from './useScrollReveal';

function daysSinceLaunch() {
  const diff = Date.now() - GG2A_LAUNCH_KST.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

interface GyeonggisatSectionProps {
  /** 배경 톤 (#161617) */
  alt?: boolean;
}

export default function GyeonggisatSection({ alt = false }: GyeonggisatSectionProps) {
  const days = daysSinceLaunch();

  return (
    <>
      <section className={`${s.tile} ${alt ? s.tileAlt : ''}`}>
        <div className={`${s.inner} ${s.center}`}>
          <span className={s.eyebrow} data-reveal="">새 위성 · 궤도에서 {days}일째</span>
          <h2 className={s.hero} data-reveal="" style={revealDelay(100)}>
            경기샛-2A,<br />
            메탄 배출원을 찾는 위성.
          </h2>
          <p className={`${s.lead} ${s.narrow}`} data-reveal="" style={revealDelay(200)}>
            국내 최초의 메탄 관측 위성입니다. 초분광 센서로 지표면 반사광을 파장별로 나눠 관측하고
            메탄이 흡수하는 파장을 분석해 <strong>배출 위치</strong>를 찾아냅니다.
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/warden/narsha-render.png"
            alt="태양전지판을 펼친 NarSha 플랫폼 메탄 관측 위성 렌더 이미지"
            className={`${s.render} ${s.renderScrub}`}
            data-progress="enter"
          />

          <div className={s.specs}>
            {GG2A_SPECS.map((sp, i) => (
              <div key={sp.label} className={s.spec} data-reveal="" style={revealDelay(i * 120)}>
                <span className={s.specValue}>
                  <span data-count={sp.value}>{sp.value}</span>
                  <span className={s.specUnit}>{sp.unit}</span>
                </span>
                <span className={s.specLabel}>{sp.label}</span>
              </div>
            ))}
          </div>

          <ol className={s.timeline} style={{ listStyle: 'none', padding: 0 }}>
            {LAUNCH_SEQUENCE.map((step, i) => (
              <li
                key={step.title}
                className={`${s.step} ${i === LAUNCH_SEQUENCE.length - 1 ? s.stepNow : ''}`}
                data-reveal=""
                style={revealDelay(i * 100)}
              >
                <span className={s.stepKey}>{step.key}</span>
                <span className={s.stepTitle}>{step.title}</span>
                <span className={s.body} style={{ fontSize: 15 }}>{step.detail}</span>
              </li>
            ))}
          </ol>

          <ul className={s.notes} data-reveal="">
            {GG2A_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </section>

    </>
  );
}
