import type { DeepDive as DeepDiveData } from '@/lib/climate-content';
import s from './climate.module.css';

interface DeepDiveProps {
  article: DeepDiveData;
}

/** 원리·맥락을 풀어 쓴 긴 글 (Muon Space FireSat 발표 페이지의 본문 서술 방식) */
export default function DeepDive({ article }: DeepDiveProps) {
  return (
    <article id={article.id} className={s.article}>
      <header data-reveal="">
        <span className={s.eyebrow}>{article.eyebrow}</span>
        <h3 className={s.articleTitle}>{article.title}</h3>
        <p className={s.articleIntro}>{article.intro}</p>
      </header>

      {article.blocks.map((b, i) => {
        switch (b.type) {
          case 'h':
            return <h4 key={i} className={s.articleH} data-reveal="">{b.text}</h4>;
          case 'p':
            return <p key={i} className={s.articleP} data-reveal="">{b.text}</p>;
          case 'quote':
            return (
              <figure key={i} className={s.articleQuote} data-reveal="">
                <blockquote>{b.text}</blockquote>
                <figcaption>{b.cite}</figcaption>
              </figure>
            );
          case 'formula':
            return (
              <figure key={i} className={s.articleFormula} data-reveal="">
                {b.lines.map((l) => (
                  <code key={l}>{l}</code>
                ))}
                <figcaption>{b.caption}</figcaption>
              </figure>
            );
          case 'note':
            return <p key={i} className={s.articleNote} data-reveal="">{b.text}</p>;
        }
      })}
    </article>
  );
}
