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

async function fillRequired(user: ReturnType<typeof userEvent.setup>, role = '금융 / 투자') {
  await user.type(screen.getByRole('textbox', { name: /이름/ }), '홍길동');
  await user.type(screen.getByRole('textbox', { name: /이메일/ }), 'hong@company.com');
  await user.type(screen.getByRole('textbox', { name: /소속/ }), '나라스페이스');
  await user.click(screen.getByRole('combobox', { name: /담당 분야/ }));
  await user.click(await screen.findByRole('option', { name: role }));
}

const submit = () => screen.getByRole('button', { name: '리포트 요청하기' });

describe('LeadCaptureModal (NDS Dialog + Form 참조 구현)', () => {
  it('open=false 면 아무것도 렌더하지 않는다', () => {
    render(<LeadCaptureModal open={false} onClose={vi.fn()} vertical="warden" accentColor="#000" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('NDS anatomy: 제목·설명, 라벨 연결 입력, 선택 항목에만 Optional 표기, Cancel/Action', () => {
    renderModal();
    const dialog = screen.getByRole('dialog', { name: '상세 리포트 요청' });
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText('Warden — 산림 컴플라이언스')).toBeTruthy();
    for (const name of [/이름/, /이메일/, /소속/, /활용 목적/]) {
      expect(screen.getByRole('textbox', { name })).toBeTruthy();
    }
    expect(screen.getAllByText('(선택)')).toHaveLength(2);
    expect(document.querySelector('[data-slot="field-required"]')).toBeNull();
    expect(screen.getByRole('button', { name: '취소' })).toBeTruthy();
    expect(submit().getAttribute('form')).toBe('lead-capture-form');
  });

  it('비어 있는 필수 필드마다 Field.Error 를 보여주고 제출하지 않는다', async () => {
    const { user } = renderModal();
    await user.click(submit());
    expect(await screen.findByText('이름을 입력해주세요.')).toBeTruthy();
    expect(screen.getByText('이메일을 입력해주세요.')).toBeTruthy();
    expect(screen.getByText('소속을 입력해주세요.')).toBeTruthy();
    expect(screen.getByText('담당 분야를 선택해주세요.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('이메일 형식이 틀리면 그 필드만 오류', async () => {
    const { user } = renderModal();
    await fillRequired(user);
    const emailInput = screen.getByRole('textbox', { name: /이메일/ });
    await user.clear(emailInput);
    await user.type(emailInput, 'not-an-email');
    await user.click(submit());
    expect(await screen.findByText('이메일 형식을 확인해주세요.')).toBeTruthy();
    expect(screen.queryByText('이름을 입력해주세요.')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('유효하면 /api/leads 로 보내고 완료 화면을 보여준다', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const { user } = renderModal();
    await fillRequired(user);
    await user.click(submit());

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

  it('서버 실패 시 오류 메시지', async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const { user } = renderModal();
    await fillRequired(user, '기타');
    await user.click(submit());
    expect((await screen.findByRole('alert')).textContent).toBe('제출에 실패했습니다. 다시 시도해주세요.');
  });

  it('취소는 onClose 를 부른다', async () => {
    const { user, onClose } = renderModal();
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalled();
  });
});
