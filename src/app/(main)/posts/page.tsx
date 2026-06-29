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
              className="aspect-[16/9] lg:aspect-auto flex items-center justify-center"
              style={{ background: 'var(--surface)', minHeight: '240px' }}
            >
              <span
                className="text-sm font-medium px-3 py-1.5 rounded"
                style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
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
              className="aspect-[16/9] flex items-center justify-center"
              style={{ background: 'var(--surface)' }}
            >
              <span
                className="text-xs font-medium px-2 py-1 rounded"
                style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
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
        <div className="text-center py-16">
          <p style={{ color: 'var(--text-muted)' }}>이 카테고리에 아직 게시물이 없습니다</p>
        </div>
      )}
    </div>
  );
}
