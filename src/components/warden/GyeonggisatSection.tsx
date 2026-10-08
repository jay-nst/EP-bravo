'use client';

import { GG2A_LAUNCH_KST, GG2A_NOTES, GG2A_SPECS, LAUNCH_SEQUENCE } from '@/lib/climate-intel';
import s from './warden.module.css';
import { revealDelay } from './useScrollReveal';

function daysSinceLaunch() {
  const diff = Date.now() - GG2A_LAUNCH_KST.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

interface GyeonggisatSectionProps {
  /** 발사 섹션 배경 (인용 섹션은 반대 톤) */
  alt?: boolean;
}

export default function GyeonggisatSection({ alt = false }: GyeonggisatSectionProps) {
  const days = daysSinceLaunch();

  return (
    <>
      <section id="gyeonggisat" className={`${s.tile} ${alt ? s.tileAlt : ''}`}>
        <div className={`${s.inner} ${s.center}`}>
          <span className={s.eyebrow} data-reveal="">새 위성 · 궤도에서 {days}일째</span>
          <h2 className={s.hero} data-reveal="" style={revealDelay(100)}>
            경기샛-2A.<br />
            메탄을 보는 위성.
          </h2>
          <p className={`${s.lead} ${s.narrow}`} data-reveal="" style={revealDelay(200)}>
            국내 최초의 메탄 관측 위성입니다. 초분광 센서가 지표면에서 반사된 빛을 아주 좁은 파장으로 쪼개고,
            메탄이 빛을 삼키는 파장을 찾아 <strong>어디서 새는지</strong> 알아냅니다.
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/warden/narsha-render.png"
            alt="태양전지판을 펼친 NarSha 플랫폼 메탄 관측 위성 렌더 이미지"
            className={s.render}
            data-reveal="zoom"
          />

          <div className={s.specs}>
            {GG2A_SPECS.map((sp, i) => (
              <div key={sp.label} className={s.spec} data-reveal="" style={revealDelay(i * 120)}>
                <span className={s.specValue}>
                  {sp.value}
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

      <section className={`${s.tile} ${alt ? '' : s.tileAlt}`}>
        <figure className={`${s.narrow} ${s.center}`} style={{ margin: '0 auto', maxWidth: 860 }}>
          <blockquote className={s.quote} data-reveal="">
            “최근 위성 기반 글로벌 메탄 배출량 데이터가 탄소 배출권 시장, 에너지 안보 측면에서 높은 가치와
            희소성을 지니는 만큼, 경기샛과 향후 발사를 준비 중인 자체 메탄 관측 위성군 ‘나르샤(NarSha)’를 통해
            우주 데이터 주권 확립과 환경 데이터 시장을 주도하는 데 기여할 것”
          </blockquote>
          <figcaption className={s.body}>박재필 · 나라스페이스 대표</figcaption>
        </figure>
      </section>
    </>
  );
}
