// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LeadCaptureModal from './LeadCaptureModal';

vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

function renderModal(onClose = vi.fn()) {
  render(<LeadCaptureModal open onClose={onClose} vertical="warden" accentColor="#6B8A5E" />);
  return { onClose, user: userEvent.setup() };
}

describe('LeadCaptureModal (NDS Dialog 참조 구현)', () => {
  it('open=false 면 아무것도 렌더하지 않는다', () => {
    render(<LeadCaptureModal open={false} onClose={vi.fn()} vertical="warden" accentColor="#000" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('dialog 로 열리고 제목·라벨이 연결된 입력을 가진다', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: '상세 리포트 요청' })).toBeTruthy();
    expect(screen.getByText('Warden — 산림 컴플라이언스')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /이름/ })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /이메일/ })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /소속/ })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /활용 목적/ })).toBeTruthy();
  });

  it('필수 항목이 비면 오류를 보여주고 제출하지 않는다', async () => {
    const { user } = renderModal();
    await user.click(screen.getByRole('button', { name: '리포트 요청하기' }));
    expect(screen.getByRole('alert').textContent).toBe('필수 항목을 모두 입력해주세요.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Select 로 담당 분야를 고르고 제출하면 /api/leads 로 보내고 완료 화면을 보여준다', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const { user } = renderModal();

    await user.type(screen.getByRole('textbox', { name: /이름/ }), '홍길동');
    await user.type(screen.getByRole('textbox', { name: /이메일/ }), 'hong@company.com');
    await user.type(screen.getByRole('textbox', { name: /소속/ }), '나라스페이스');
    await user.click(screen.getByRole('combobox', { name: /담당 분야/ }));
    await user.click(await screen.findByRole('option', { name: '금융 / 투자' }));
    await user.click(screen.getByRole('button', { name: '리포트 요청하기' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/leads');
    expect(JSON.parse(init.body)).toEqual({
      name: '홍길동',
      email: 'hong@company.com',
      company: '나라스페이스',
      role: 'finance',
      use_case: '',
      budget: '',
      vertical: 'warden',
    });
    expect(await screen.findByRole('dialog', { name: '등록 완료' })).toBeTruthy();
  });

  it('제출 실패 시 오류를 보여준다', async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const { user } = renderModal();
    await user.type(screen.getByRole('textbox', { name: /이름/ }), 'a');
    await user.type(screen.getByRole('textbox', { name: /이메일/ }), 'a@b.c');
    await user.type(screen.getByRole('textbox', { name: /소속/ }), 'c');
    await user.click(screen.getByRole('combobox', { name: /담당 분야/ }));
    await user.click(await screen.findByRole('option', { name: '기타' }));
    await user.click(screen.getByRole('button', { name: '리포트 요청하기' }));
    expect((await screen.findByRole('alert')).textContent).toBe('제출에 실패했습니다. 다시 시도해주세요.');
  });

  it('닫기 버튼은 onClose 를 부른다', async () => {
    const { user, onClose } = renderModal();
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalled();
  });
});
