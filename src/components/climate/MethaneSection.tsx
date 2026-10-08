import {
  METHANE_ADVANTAGES,
  METHANE_FACTS,
  METHANE_HOW,
  METHANE_INDUSTRIES,
  METHANE_REGULATIONS,
  NARSHA_SPECS,
} from '@/lib/climate-content';
import s from './climate.module.css';
import { revealDelay } from './useScrollReveal';

const CEO_QUOTE =
  '“최근 위성 기반 글로벌 메탄 배출량 데이터가 탄소 배출권 시장, 에너지 안보 측면에서 높은 가치와 희소성을 지니는 만큼, 경기샛과 향후 발사를 준비 중인 자체 메탄 관측 위성군 ‘나르샤(NarSha)’를 통해 우주 데이터 주권 확립과 환경 데이터 시장을 주도하는 데 기여할 것”';
const QUOTE_WORDS = CEO_QUOTE.split(' ');

/** 메탄 흡수 개념도 — 실측 스펙트럼 아님. 1625–1670 nm 구간에 흡수선이 파인 모양만 표현 */
function SpectrumDiagram() {
  const W = 880;
  const H = 220;
  const x0 = 40;
  const x1 = W - 20;
  const toX = (nm: number) => x0 + ((nm - 1625) / 45) * (x1 - x0);
  // 개념용 흡수선 위치·깊이 (1665.6 nm 는 경기샛-2A 항공시험 first light 파장)
  const dips: [number, number][] = [
    [1631, 0.18], [1638, 0.22], [1642.5, 0.3], [1645.5, 0.26], [1648.6, 0.42],
    [1651.7, 0.36], [1654.8, 0.3], [1658.2, 0.38], [1661.1, 0.5], [1665.6, 0.78],
  ];
  const base = 40;
  const amp = 150;
  const pts: string[] = [];
  for (let nm = 1625; nm <= 1670; nm += 0.15) {
    let depth = 0;
    for (const [c, d] of dips) depth += d * Math.exp(-((nm - c) ** 2) / (2 * 0.35 ** 2));
    pts.push(`${toX(nm).toFixed(1)},${(base + Math.min(depth, 0.95) * amp).toFixed(1)}`);
  }
  const peakX = toX(1665.6);

  return (
    <figure className={s.diagram} data-reveal="">
      <svg viewBox={`0 0 ${W} ${H + 40}`} role="img" aria-label="메탄 흡수선 개념도: 1625에서 1670 나노미터 구간에서 메탄이 특정 파장의 빛을 흡수해 신호가 움푹 파인다">
        <line x1={x0} x2={x1} y1={H + 4} y2={H + 4} stroke="rgba(255,255,255,0.15)" />
        <polyline className={s.specLine} pathLength={1} points={pts.join(' ')} fill="none" stroke="#f5f5f7" strokeWidth="2" strokeLinejoin="round" />
        <line className={s.specMark} x1={peakX} x2={peakX} y1={base - 10} y2={H + 4} stroke="#1bbfa8" strokeDasharray="3 4" />
        <text className={s.specMark} x={peakX - 8} y={base - 18} textAnchor="end" fill="#1bbfa8" fontSize="15" fontWeight="600">
          1665.6 nm 메탄 흡수선
        </text>
        {[1625, 1640, 1655, 1670].map((nm) => (
          <text key={nm} x={toX(nm)} y={H + 28} textAnchor={nm === 1625 ? 'start' : nm === 1670 ? 'end' : 'middle'} fill="#86868b" fontSize="13">
            {nm} nm
          </text>
        ))}
        <text x={x0} y={base - 18} fill="#86868b" fontSize="13">빛의 세기</text>
      </svg>
      <figcaption className={s.fine} style={{ textAlign: 'center', marginTop: 8 }}>
        개념도 · 메탄이 흡수하는 파장에서 빛이 약해짐 · 실측 스펙트럼 아님
      </figcaption>
    </figure>
  );
}

export default function MethaneSection() {
  return (
    <>
      {/* 왜 메탄인가 */}
      <section className={s.tile}>
        <div className={s.inner}>
          <div className={s.center} data-reveal="">
            <span className={s.eyebrow}>왜 메탄인가</span>
            <h2 className={s.h2}>보이지 않지만,<br />가장 빨리 줄일 수 있는 온실가스.</h2>
            <p className={`${s.lead} ${s.narrow}`}>
              메탄의 온실효과는 이산화탄소보다 훨씬 큽니다. 다만 대기 중에 머무는 기간이 짧아
              배출원을 찾아 줄이면 감축 효과가 <strong>빠르게</strong> 나타납니다.
            </p>
          </div>
          <div className={`${s.specs} ${s.specs4}`}>
            {METHANE_FACTS.map((f, i) => (
              <div key={f.label} className={s.spec} data-reveal="" style={revealDelay(i * 100)}>
                <span className={s.specValue}>
                  <span data-count={f.value}>{f.value}</span>
                  <span className={s.specUnit}>{f.unit}</span>
                </span>
                <span className={s.specLabel}>{f.label}</span>
                <span className={s.specSource}>{f.source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 어떻게 찾나 */}
      <section className={`${s.tile} ${s.tileAlt}`}>
        <div className={s.inner}>
          <div className={s.center} data-reveal="">
            <span className={s.eyebrow}>관측 원리</span>
            <h2 className={s.h2}>빛의 파장으로<br />메탄을 찾아냅니다.</h2>
            <p className={`${s.lead} ${s.narrow}`}>
              지표에서 반사된 햇빛이 위성으로 돌아오다가 메탄을 통과하면 특정 파장만 약해집니다. 초분광 센서는 이 차이를 포착합니다.
            </p>
          </div>

          <SpectrumDiagram />

          <ol className={`${s.timeline} ${s.timeline3}`} style={{ listStyle: 'none', padding: 0 }}>
            {METHANE_HOW.map((step, i) => (
              <li key={step.num} className={s.step} data-reveal="" style={revealDelay(i * 100)}>
                <span className={s.stepKey}>{step.num}</span>
                <span className={s.stepTitle}>{step.title}</span>
                <span className={s.body} style={{ fontSize: 15 }}>{step.desc}</span>
              </li>
            ))}
          </ol>

          <ul className={s.notes} data-reveal="">
            <li>경기샛-2A 항공시험에서 1665.6 nm 메탄 흡수선 첫 검출 (first light)</li>
            <li>서울대 기후연구실과 공동 추진하는 나르샤 프로젝트 (2023~)</li>
          </ul>
        </div>
      </section>

      {/* 강점 */}
      <section className={s.tile}>
        <div className={s.inner}>
          <div className={s.center} style={{ marginBottom: 56 }} data-reveal="">
            <span className={s.eyebrow}>NarSha</span>
            <h2 className={s.h2}>어느 시설에서 새는지<br />알려드립니다.</h2>
          </div>
          <div className={s.grid2}>
            {METHANE_ADVANTAGES.map((a, i) => (
              <div key={a.title} className={s.card} data-reveal="" style={revealDelay((i % 2) * 120)}>
                <h3 className={s.h3}>{a.title}</h3>
                <p className={s.body}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 업종별 활용 */}
      <section className={`${s.tile} ${s.tileAlt}`}>
        <div className={s.inner}>
          <div className={s.center} style={{ marginBottom: 56 }} data-reveal="">
            <span className={s.eyebrow}>활용 분야</span>
            <h2 className={s.h2}>메탄 위험은<br />업종마다 다릅니다.</h2>
          </div>
          <div className={s.grid2}>
            {METHANE_INDUSTRIES.map((ind, i) => (
              <div key={ind.id} className={s.card} data-reveal="" style={revealDelay((i % 2) * 120)}>
                <h3 className={s.h3}>{ind.title}</h3>
                <p className={s.body} style={{ marginBottom: 16 }}>{ind.problem}</p>
                <p className={s.body} style={{ color: 'var(--w-text)' }}>
                  <span className={s.statusLive} style={{ fontWeight: 600 }}>NarSha </span>
                  {ind.solution}
                </p>
              </div>
            ))}
          </div>
          <ul className={s.notes} data-reveal="">
            <li>2026.09 카자흐스탄 국영우주공사(KGS)와 메탄 MRV 데이터 공급 계약 · 경기샛-2A·2B, NarSha 데이터</li>
          </ul>
        </div>
      </section>

      {/* 규제 */}
      <section className={s.tile}>
        <div className={s.inner}>
          <div className={s.center} data-reveal="">
            <span className={s.eyebrow}>규제</span>
            <h2 className={s.h2}>측정하지 못하면<br />줄일 수 없습니다.</h2>
            <p className={`${s.lead} ${s.narrow}`}>
              주요국은 이미 메탄을 수치로 보고하도록 요구하고 있습니다. 자체 보고만으로는 부족해 이제 독립적인 검증 데이터가 필요합니다.
            </p>
          </div>
          <div className={s.specs}>
            {METHANE_REGULATIONS.map((r, i) => (
              <div key={r.label} className={s.spec} data-reveal="" style={revealDelay(i * 120)}>
                <span className={s.specValue}><span data-count={r.value}>{r.value}</span></span>
                <span className={s.specLabel} style={{ display: 'block', color: 'var(--w-text)', marginBottom: 6 }}>{r.label}</span>
                <span className={s.specLabel} style={{ fontSize: 13 }}>{r.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 제원 */}
      <section className={`${s.tile} ${s.tileAlt}`}>
        <div className={s.inner}>
          <div className={s.center} style={{ marginBottom: 56 }} data-reveal="">
            <h2 className={s.h2}>NarSha 제원.</h2>
            <p className={`${s.lead} ${s.narrow}`}>경기샛-2A·2B는 같은 플랫폼을 공유합니다.</p>
          </div>
          <div className={s.grid3}>
            {NARSHA_SPECS.map((g, i) => (
              <div key={g.group} data-reveal="" style={revealDelay(i * 120)}>
                <h3 className={s.specGroup}>{g.group}</h3>
                <dl className={s.specList}>
                  {g.rows.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <p className={`${s.fine} ${s.center}`} style={{ marginTop: 40 }}>NarSha 리플렛 (2026.08) 기준 · 일부 수치는 설계 목표</p>
        </div>
      </section>

      {/* 인용 */}
      <section className={s.tile}>
        <figure className={`${s.narrow} ${s.center}`} style={{ margin: '0 auto', maxWidth: 860 }}>
          {/* 스크롤에 따라 단어가 차례로 밝아짐 */}
          <blockquote
            className={`${s.quote} ${s.quoteWords}`}
            data-progress="through"
            style={{ '--n': QUOTE_WORDS.length } as React.CSSProperties}
          >
            {QUOTE_WORDS.map((w, i) => (
              <span key={i} style={{ '--i': i } as React.CSSProperties}>
                {w}{i < QUOTE_WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </blockquote>
          <figcaption className={s.body}>박재필 · 나라스페이스 대표</figcaption>
        </figure>
      </section>
    </>
  );
}
