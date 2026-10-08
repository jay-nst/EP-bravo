'use client';

import { useEffect, useRef, useState } from 'react';
import { Form } from '@base-ui/react/form';
import { Button, Textarea } from '@naraspace-technology/nds/components';
import { IconPlus } from '@naraspace-technology/nds/icons';

// 색 기준 78e9433 — NDS Button 의 색만 원래 값으로 덮는다 (hover 때 바뀌던 색이 없던 것은 hover 도 고정)
const HOVER_KEEP = 'not-data-disabled:not-aria-invalid:hover:';
/** + 새 대화: surface-elevated 배경, text 글자, 테두리 없음 */
const NEW_SESSION_CLS = `bg-bg-primary text-text-primary inset-ring-transparent ${HOVER_KEEP}bg-bg-primary ${HOVER_KEEP}inset-ring-transparent`;
/** 세션 목록: 선택 = accent 글자 + surface-elevated 배경, 나머지 = muted 글자 */
const SESSION_ACTIVE_CLS = `bg-bg-primary text-text-interactive-primary [&_svg]:text-text-interactive-primary not-data-disabled:data-active:not-hover:text-text-interactive-primary ${HOVER_KEEP}text-text-interactive-primary`;
const SESSION_IDLE_CLS = `text-text-tertiary [&_svg]:text-text-tertiary ${HOVER_KEEP}text-text-tertiary`;
/** 추천 질문 칩: surface 배경, muted 글자, border 테두리 */
const SUGGEST_CLS = `bg-bg-secondary text-text-tertiary inset-ring-border-tertiary ${HOVER_KEEP}bg-bg-secondary ${HOVER_KEEP}inset-ring-border-tertiary`;
/** 전송: 민트 CTA (accent 배경 + 어두운 글자), disabled 는 accent 40% */
const SEND_CLS =
  'bg-bg-interactive-primary text-[#0E0E10] not-data-disabled:data-active:not-hover:text-[#0E0E10] data-disabled:bg-bg-interactive-primary data-disabled:text-[#0E0E10] data-disabled:opacity-40';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  default:
    '안녕하세요! 위성 영상 관련 질문에 답변해드리겠습니다. 촬영 요청, 가격, 해상도, 데이터 형식 등 무엇이든 물어보세요.',
  해상도:
    'EarthPaper에서 제공하는 위성 영상 해상도는 위성에 따라 다릅니다:\n\n• SpaceEye-T: 25cm (초고해상도)\n• Observer: 50cm\n• Kompsat-3A: 55cm\n• Sentinel-2: 10m (무료)\n\n용도에 맞는 해상도를 선택하시면 됩니다.',
  가격: '위성 영상 가격은 위성 종류와 면적에 따라 결정됩니다:\n\n• SpaceEye-T: $15/km²\n• Observer: $12/km²\n• Kompsat-3A: $10/km²\n\n최소 주문 면적은 위성별로 다르며, /tasking 페이지에서 직접 영역을 그려 예상 가격을 확인할 수 있습니다.',
  촬영: '새로운 위성 촬영을 요청하시려면:\n\n1. /tasking 페이지로 이동\n2. "+ 새 요청" 클릭\n3. 지도에서 촬영할 영역 그리기\n4. 희망 촬영 날짜와 연락처 입력\n5. 제출\n\n접수 후 1-2일 내 검토 결과를 안내드립니다.',
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('해상도') || lower.includes('resolution')) return MOCK_RESPONSES['해상도'];
  if (lower.includes('가격') || lower.includes('price') || lower.includes('비용')) return MOCK_RESPONSES['가격'];
  if (lower.includes('촬영') || lower.includes('요청') || lower.includes('tasking')) return MOCK_RESPONSES['촬영'];
  return MOCK_RESPONSES['default'];
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/chat/sessions')
      .then((r) => r.json())
      .then((data) => {
        if (data.sessions) setSessions(data.sessions);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createSession = () => {
    const newSession: ChatSession = {
      id: `sess-${Date.now()}`,
      title: '새 대화',
      updated_at: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setSessionId(newSession.id);
    setMessages([]);
  };

  const sendMessage = async (directMessage?: string) => {
    const msg = directMessage || input.trim();
    if (!msg || streaming) return;

    if (!sessionId) {
      const newSession: ChatSession = {
        id: `sess-${Date.now()}`,
        title: msg.slice(0, 20),
        updated_at: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSession.id);
    }

    const userMessage = msg;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setStreaming(true);

    const response = getMockResponse(userMessage);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    let displayed = '';
    for (let i = 0; i < response.length; i++) {
      displayed += response[i];
      const current = displayed;
      await new Promise((r) => setTimeout(r, 15));
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: current };
        return updated;
      });
    }

    setStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex" style={{ height: 'calc(100vh - var(--header-height))' }}>
      <aside className="flex w-240 flex-col border-r border-border-tertiary bg-bg-secondary">
        <div className="p-12">
          <Button variant="outline" display="block" leftIcon={<IconPlus />} onClick={createSession} className={NEW_SESSION_CLS}>
            새 대화
          </Button>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-8">
          {sessions.map((s) => (
            <Button
              key={s.id}
              variant="text"
              display="block"
              active={sessionId === s.id}
              onClick={() => {
                setSessionId(s.id);
                setMessages([]);
              }}
              className={`justify-start ${sessionId === s.id ? SESSION_ACTIVE_CLS : SESSION_IDLE_CLS}`}
            >
              <span className="truncate">{s.title}</span>
            </Button>
          ))}
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="flex-1 space-y-16 overflow-y-auto p-16">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="space-y-12 text-center">
                <p className="text-heading-lg text-text-tertiary">
                  위성 영상 전문 어시스턴트
                </p>
                <p className="text-body-md-regular text-text-tertiary">
                  위성 영상 촬영, 가격, 해상도 등에 대해 질문하세요
                </p>
                <div className="flex flex-wrap justify-center gap-8 pt-8">
                  {['해상도 비교', '가격 안내', '촬영 요청 방법'].map((q) => (
                    <Button key={q} variant="outline" size="sm" onClick={() => sendMessage(q)} className={SUGGEST_CLS}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] whitespace-pre-wrap rounded-md px-16 py-10 text-body-sm-regular ${
                  msg.role === 'user'
                    ? 'bg-bg-interactive-primary text-[#0E0E10]'
                    : 'bg-bg-secondary text-text-primary'
                }`}
              >
                {msg.content}
                {msg.role === 'assistant' && !msg.content && streaming && (
                  <span className="inline-block h-16 w-8 animate-pulse bg-bg-interactive-primary" />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border-tertiary p-16">
          <Form onFormSubmit={() => sendMessage()} className="mx-auto flex max-w-3xl gap-8">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              aria-label="메시지"
              rows={1}
              className="flex-1 bg-bg-secondary data-disabled:bg-bg-secondary data-disabled:inset-ring-border-tertiary"
              disabled={streaming}
            />
            <Button type="submit" disabled={streaming || !input.trim()} className={SEND_CLS}>
              전송
            </Button>
          </Form>
        </div>
      </main>
    </div>
  );
}
