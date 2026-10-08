'use client';

import { useState } from 'react';
import { CURATED_POSTS, POST_CATEGORY_LABELS, type PostCategory } from '@/lib/climate-intel';
import s from './warden.module.css';

type Filter = 'all' | PostCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '전체' },
  ...(Object.keys(POST_CATEGORY_LABELS) as PostCategory[]).map((k) => ({ key: k, label: POST_CATEGORY_LABELS[k] })),
];

export default function PostCuration() {
  const [filter, setFilter] = useState<Filter>('all');
  const posts = filter === 'all' ? CURATED_POSTS : CURATED_POSTS.filter((p) => p.category === filter);

  return (
    <section id="posts" className={`${s.tile} ${s.tileAlt}`}>
      <div className={s.inner}>
        <div className={s.center}>
          <h2 className={s.h2}>위성이 기록한 기후.</h2>
          <p className={`${s.lead} ${s.narrow}`}>
            EarthPaper가 직접 분석한 산불, 홍수, 산림, 식량 이야기입니다.
          </p>
        </div>

        <div role="tablist" aria-label="분석 카테고리" className={s.chips}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`${s.chip} ${filter === f.key ? s.chipOn : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={s.grid3}>
          {posts.map((p) => (
            <a key={p.id} href={p.href} target="_blank" rel="noopener noreferrer" className={s.post}>
              <div className={s.postImg}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail} alt="" loading="lazy" />
              </div>
              <div className={s.postBody}>
                <span className={s.cardMeta}>
                  {POST_CATEGORY_LABELS[p.category]} · {p.location}
                </span>
                <h3 className={s.postTitle}>{p.title}</h3>
                <p className={s.body} style={{ fontSize: 15 }}>{p.desc}</p>
              </div>
            </a>
          ))}
        </div>

        <div className={s.center} style={{ marginTop: 40 }}>
          <a href="https://ep.naraspace.com/ko" target="_blank" rel="noopener noreferrer" className={s.link}>
            ep.naraspace.com에서 전체 분석 보기
          </a>
        </div>
      </div>
    </section>
  );
}
