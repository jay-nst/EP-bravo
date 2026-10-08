'use client';

import { GG2A_LAUNCH_KST, GG2A_SPECS, GYEONGGISAT_FLEET, LAUNCH_SEQUENCE } from '@/lib/climate-intel';
import s from './warden.module.css';

function daysSinceLaunch() {
  const diff = Date.now() - GG2A_LAUNCH_KST.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function GyeonggisatSection() {
  const days = daysSinceLaunch();

  return (
    <>
      {/* 발사 */}
      <section id="gyeonggisat" className={`${s.tile} ${s.tileAlt}`}>
        <div className={`${s.inner} ${s.center}`}>
          <span className={s.eyebrow}>새 위성 · 궤도에서 {days}일째</span>
          <h2 className={s.hero}>
            경기샛-2A.<br />
            메탄을 보는 위성.
          </h2>
          <p className={`${s.lead} ${s.narrow}`}>
            국내 최초의 메탄 관측 위성입니다. 초분광 센서가 지표면에서 반사된 빛을 아주 좁은 파장으로 쪼개고,
            메탄이 빛을 삼키는 파장을 찾아 <strong>어디서 새는지</strong> 알아냅니다.
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/warden/narsha-render.png"
            alt="태양전지판을 펼친 NarSha 플랫폼 메탄 관측 위성 렌더 이미지"
            className={s.render}
          />

          <div className={s.specs}>
            {GG2A_SPECS.map((sp) => (
              <div key={sp.label} className={s.spec}>
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
              <li key={step.title} className={`${s.step} ${i === LAUNCH_SEQUENCE.length - 1 ? s.stepNow : ''}`}>
                <span className={s.stepKey}>{step.key}</span>
                <span className={s.stepTitle}>{step.title}</span>
                <span className={s.body} style={{ fontSize: 15 }}>{step.detail}</span>
              </li>
            ))}
          </ol>

          <p className={s.fine} style={{ marginTop: 48 }}>
            캐나다, 스페인, 프랑스에 이어 세계 네 번째 메탄 관측 초소형위성입니다(나라스페이스 발표 기준).
            경기도, 서울대 기후연구실과 함께 추진하는 경기기후위성 사업의 두 번째 위성입니다.
          </p>
        </div>
      </section>

      {/* 경기샛 3기 */}
      <section className={s.tile}>
        <div className={s.inner}>
          <div className={s.center} style={{ marginBottom: 56 }}>
            <h2 className={s.h2}>세 개의 눈이<br />경기도를 지켜봅니다.</h2>
            <p className={`${s.lead} ${s.narrow}`}>
              광학 위성 하나와 메탄 위성 둘. 각자 맡은 임무로 3년 동안 경기도 상공을 돕니다.
            </p>
          </div>
          <div className={s.grid3}>
            {GYEONGGISAT_FLEET.map((sat) => (
              <div key={sat.id} className={s.card}>
                <span className={s.cardMeta}>{sat.type}</span>
                <h3 className={s.h3}>{sat.name}</h3>
                <p className={s.body}>{sat.target}</p>
                <div className={s.cardFoot}>
                  <p className={s.body} style={{ fontSize: 15, color: 'var(--w-text)', marginBottom: 6 }}>{sat.specs}</p>
                  <span className={`${s.status} ${sat.status === 'planned' ? '' : s.statusLive}`}>
                    {sat.status === 'planned' ? sat.statusLabel : `${sat.launch} · ${sat.statusLabel}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className={`${s.card} ${s.narrow}`} style={{ marginTop: 20, maxWidth: 'none' }}>
            <span className={s.cardMeta}>다음은 NarSha</span>
            <p className={s.body}>
              경기샛-2A·2B와 같은 플랫폼으로 나라스페이스 자체 메탄 관측 군집 NarSha를 만들고 있습니다.
              2026년 2월 국내 민간 메탄 위성으로는 처음 CEOS 공식 포털에 이름을 올렸고,
              카자흐스탄 국영우주공사(KGS)에 메탄 MRV 데이터를 공급하기로 했습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 인용 */}
      <section className={`${s.tile} ${s.tileAlt}`}>
        <figure className={`${s.narrow} ${s.center}`} style={{ margin: '0 auto', maxWidth: 860 }}>
          <blockquote className={s.quote}>
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
