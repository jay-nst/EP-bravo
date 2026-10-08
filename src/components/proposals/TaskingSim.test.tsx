// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TaskingSim, { type TaskingSimMode } from './TaskingSim';

function renderSim(mode: TaskingSimMode, orderId: string | null = null) {
  const handlers = {
    onPreview: vi.fn(),
    onOrder: vi.fn(),
    onBuy: vi.fn(),
    onAgree: vi.fn(),
    onPay: vi.fn(),
  };
  render(<TaskingSim mode={mode} scale={1} previewId={null} orderId={orderId} {...handlers} />);
  return { ...handlers, user: userEvent.setup() };
}

describe('TaskingSim (실서비스 Tasking 화면 재현)', () => {
  it('궤도 목록은 예시 일정임을 밝히고, 날짜·UTC 시각·흐릴 확률을 실서비스 형식으로 보여 준다', () => {
    renderSim('orbits');
    expect(screen.getByText('예시 일정입니다. 실제 위성 궤도가 아닙니다.')).toBeTruthy();
    expect(screen.getByText('2026.10.10')).toBeTruthy();
    expect(screen.getByText('02:14 UTC')).toBeTruthy();
    expect(screen.getByText('흐릴 확률 18%')).toBeTruthy();
  });

  it('시뮬레이션 대기 중에는 궤도 카드 대신 스켈레톤을 보여 준다', () => {
    renderSim('loading');
    expect(screen.queryByText('흐릴 확률 18%')).toBeNull();
    expect(screen.queryByText('예시 일정입니다. 실제 위성 궤도가 아닙니다.')).toBeNull();
  });

  it('동그라미를 체크하면 그 궤도로 구매 대상을 정하고, 카드 본문 클릭은 지도 미리보기만 바꾼다', async () => {
    const { user, onOrder, onPreview } = renderSim('orbits');
    // 날짜는 체크박스의 Field.Label 이라 체크와 같은 동작 — 본문은 시각 줄로 누른다
    await user.click(screen.getByText('02:14 UTC'));
    expect(onPreview).toHaveBeenCalledWith('example-1');
    expect(onOrder).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole('checkbox')[1]);
    expect(onOrder).toHaveBeenCalledWith('example-2');
  });

  it('하단 바는 1 Scene · $1,800.00 · 구매하기 (면적 대신 장면 수)', async () => {
    const { user, onBuy } = renderSim('selected', 'example-1');
    expect(screen.getByText('1 Scene')).toBeTruthy();
    expect(screen.getByText('$1,800.00')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '구매하기' }));
    expect(onBuy).toHaveBeenCalledTimes(1);
  });

  it('구매 시트의 결제하기는 안내 동의 전까지 비활성이다', async () => {
    const { user, onAgree } = renderSim('sheet', 'example-1');
    expect(screen.getByText('SpaceEye-T (Assured)')).toBeTruthy();
    expect(screen.getByRole('button', { name: '결제하기' }).hasAttribute('disabled')).toBe(true);
    await user.click(screen.getByRole('checkbox', { name: '구매 전 안내 사항을 확인하였습니다.' }));
    expect(onAgree).toHaveBeenCalledTimes(1);
  });

  it('동의 후에는 결제하기가 켜지고 누르면 결제로 넘어간다', async () => {
    const { user, onPay } = renderSim('agreed', 'example-1');
    const pay = screen.getByRole('button', { name: '결제하기' });
    expect(pay.hasAttribute('disabled')).toBe(false);
    await user.click(pay);
    expect(onPay).toHaveBeenCalledTimes(1);
  });
});
