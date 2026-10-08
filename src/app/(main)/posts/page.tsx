'use client';

import { useState } from 'react';
import { Button, Card, SelectChip } from '@naraspace-technology/nds/components';
import { IconSatellite } from '@naraspace-technology/nds/icons';
import { POSTS, CATEGORIES } from '@/lib/sample-data';

export default function PostsPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered =
    activeCategory === 'all'
      ? POSTS
      : POSTS.filter((p) => p.category === activeCategory);

  return (
    <div className="mx-auto w-full max-w-6xl px-16 py-32">
      <div className="mb-24 flex items-center justify-between">
        <div>
          <h1 className="text-heading-3xl text-text-primary">
            위성으로 보는 오늘
          </h1>
          <p className="mt-4 text-body-sm-regular text-text-tertiary">
            오늘의 이슈를 궤도 위에서 바라봅니다
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-32 flex gap-8 overflow-x-auto pb-8">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <SelectChip
              key={cat.id}
              active={isActive}
              aria-pressed={isActive}
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0"
            >
              {cat.label}
            </SelectChip>
          );
        })}
      </div>

      {/* Featured Post (first) — 이미지 영역이 가장자리까지 차서 inset-ring 대신 border 로 테두리 */}
      {filtered.length > 0 && (
        <div className="mb-32 block overflow-hidden rounded-lg border border-border-tertiary bg-bg-tertiary">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div
              className="relative flex aspect-[16/9] min-h-240 items-center justify-center overflow-hidden lg:aspect-auto"
              style={{ background: 'linear-gradient(135deg, #0a1a15 0%, #0d2818 30%, #0a1612 60%, #111a14 100%)' }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(rgba(27,191,168,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <span className="relative z-10 rounded-full bg-bg-primary/80 px-12 py-6 text-body-sm-medium text-text-tertiary">
                {filtered[0].category}
              </span>
            </div>
            <div className="flex flex-col justify-center space-y-12 p-24">
              <div className="flex items-center gap-8 text-body-xs-regular tabular-nums text-text-tertiary">
                <span>{filtered[0].date}</span>
                <span className="text-border-tertiary">·</span>
                <span>{filtered[0].readTime} 읽기</span>
              </div>
              <h2 className="text-heading-xl text-text-primary">
                {filtered[0].title}
              </h2>
              <p className="text-body-sm-regular text-text-tertiary">
                {filtered[0].summary}
              </p>
              <p className="text-body-xs-regular text-text-tertiary">
                {filtered[0].author}
              </p>
              {filtered[0].newsHeadline && (
                <div className="mt-4 flex items-center gap-8 rounded-md bg-bg-secondary px-12 py-8 text-body-xs-regular text-text-tertiary">
                  <span className="text-text-interactive-primary">관련</span>
                  <span className="truncate">{filtered[0].newsHeadline}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Grid */}
      <div className="grid grid-cols-1 gap-20 md:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(1).map((post) => (
          <Card.Root key={post.id}>
            <div
              className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-md"
              style={{ background: 'linear-gradient(135deg, #0a1a15 0%, #0d2216 40%, #0f1a12 100%)' }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(rgba(27,191,168,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.04) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />
              <span className="relative z-10 rounded-full bg-bg-primary/80 px-8 py-4 text-body-xs-regular text-text-tertiary">
                {post.category}
              </span>
            </div>
            <Card.Body className="gap-8">
              <Card.Title>{post.title}</Card.Title>
              <Card.Content className="line-clamp-2 text-text-tertiary">
                {post.summary}
              </Card.Content>
              <div className="flex items-center justify-between text-body-xs-regular text-text-tertiary">
                <span>{post.author}</span>
                <div className="flex items-center gap-8 tabular-nums">
                  <span>{post.date}</span>
                  <span className="text-border-tertiary">·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Card.Body>
          </Card.Root>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="space-y-12 py-64 text-center">
          <div className="mx-auto flex size-56 items-center justify-center rounded-full bg-bg-secondary">
            <IconSatellite className="size-24 text-icon-tertiary" />
          </div>
          <p className="text-body-sm-regular text-text-tertiary">이 카테고리에 아직 게시물이 없습니다</p>
          <Button variant="outline" onClick={() => setActiveCategory('all')}>
            전체 보기
          </Button>
        </div>
      )}
    </div>
  );
}
