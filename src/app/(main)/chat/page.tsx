'use client';

import { useEffect, useRef, useState } from 'react';

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

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    if (!sessionId) {
      const newSession: ChatSession = {
        id: `sess-${Date.now()}`,
        title: input.trim().slice(0, 20),
        updated_at: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSession.id);
    }

    const userMessage = input.trim();
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
      <aside
        className="w-60 flex flex-col"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="p-3">
          <button
            onClick={createSession}
            className="w-full px-3 py-2 text-sm rounded-md transition-colors"
            style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
          >
            + 새 대화
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSessionId(s.id);
                setMessages([]);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-md mb-0.5 truncate transition-colors"
              style={{
                color: sessionId === s.id ? 'var(--accent)' : 'var(--text-muted)',
                background: sessionId === s.id ? 'var(--surface-elevated)' : 'transparent',
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>
                  위성 영상 전문 어시스턴트
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  위성 영상 촬영, 가격, 해상도 등에 대해 질문하세요
                </p>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {['해상도 비교', '가격 안내', '촬영 요청 방법'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                      style={{
                        background: 'var(--surface)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {q}
                    </button>
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
                className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)',
                  color: msg.role === 'user' ? '#0E0E10' : 'var(--text)',
                }}
              >
                {msg.content}
                {msg.role === 'assistant' && !msg.content && streaming && (
                  <span
                    className="inline-block w-2 h-4 animate-pulse"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="max-w-3xl mx-auto flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className="flex-1 px-4 py-3 text-sm resize-none rounded-xl focus:outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              disabled={streaming}
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
              style={{
                background: 'var(--accent)',
                color: '#0E0E10',
              }}
            >
              전송
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
