'use client';

import Link from 'next/link';
import { useState } from 'react';
import { POSTS, CATEGORIES } from '@/lib/sample-data';

export default function PostsPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered =
    activeCategory === 'all'
      ? POSTS
      : POSTS.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
            위성으로 보는 오늘
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            오늘의 이슈를 궤도 위에서 바라봅니다
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors"
              style={{
                background: isActive ? 'var(--accent)' : 'var(--surface)',
                color: isActive ? '#0E0E10' : 'var(--text-muted)',
                border: isActive ? 'none' : '1px solid var(--border)',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Featured Post (first) */}
      {filtered.length > 0 && (
        <Link
          href={`/posts/${filtered[0].id}`}
          className="block rounded-xl overflow-hidden mb-8 transition-colors"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div
              className="aspect-[16/9] lg:aspect-auto flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0a1a15 0%, #0d2818 30%, #0a1612 60%, #111a14 100%)', minHeight: '240px' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(27,191,168,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <span
                className="text-sm font-medium px-3 py-1.5 rounded relative z-10"
                style={{ background: 'rgba(36,36,41,0.8)', color: 'var(--text-muted)' }}
              >
                {filtered[0].category}
              </span>
            </div>
            <div className="p-6 flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{filtered[0].date}</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span>{filtered[0].readTime} 읽기</span>
              </div>
              <h2 className="text-xl font-semibold leading-snug" style={{ color: 'var(--text)' }}>
                {filtered[0].title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {filtered[0].summary}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {filtered[0].author}
              </p>
              {filtered[0].newsHeadline && (
                <div
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mt-1"
                  style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
                >
                  <span style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 600 }}>관련</span>
                  <span className="truncate">{filtered[0].newsHeadline}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      )}

      {/* Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.slice(1).map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="rounded-xl overflow-hidden transition-colors"
            style={{ border: '1px solid var(--border)' }}
          >
            <div
              className="aspect-[16/9] flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0a1a15 0%, #0d2216 40%, #0f1a12 100%)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(27,191,168,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.04) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />
              <span
                className="text-xs font-medium px-2 py-1 rounded relative z-10"
                style={{ background: 'rgba(36,36,41,0.8)', color: 'var(--text-muted)' }}
              >
                {post.category}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-base font-semibold leading-snug" style={{ color: 'var(--text)' }}>
                {post.title}
              </h3>
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {post.summary}
              </p>
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{post.author}</span>
                <div className="flex items-center gap-2">
                  <span>{post.date}</span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div
            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl"
            style={{ background: 'var(--surface)' }}
          >
            &#128752;
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>이 카테고리에 아직 게시물이 없습니다</p>
          <button
            onClick={() => setActiveCategory('all')}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)' }}
          >
            전체 보기
          </button>
        </div>
      )}
    </div>
  );
}
