'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

export default function ChatPage() {
  const supabase = useMemo(() => createClient(), []);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/chat/sessions')
      .then((r) => r.json())
      .then((data) => {
        if (data.sessions) setSessions(data.sessions);
      });
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setMessages(
            data.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          );
        }
      });
  }, [sessionId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createSession = async () => {
    const res = await fetch('/api/chat/sessions', { method: 'POST' });
    const data = await res.json();
    if (data.session) {
      setSessions((prev) => [data.session, ...prev]);
      setSessionId(data.session.id);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      const res = await fetch('/api/chat/sessions', { method: 'POST' });
      const data = await res.json();
      if (!data.session) {
        setError('세션 생성 실패');
        return;
      }
      currentSessionId = data.session.id;
      setSessions((prev) => [data.session, ...prev]);
      setSessionId(currentSessionId);
    }

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: userMessage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || '오류가 발생했습니다');
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError('스트림을 읽을 수 없습니다');
        setStreaming(false);
        return;
      }

      let assistantContent = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              assistantContent += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: assistantContent,
                };
                return updated;
              });
            }
            if (parsed.error) {
              setError(parsed.error);
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      if (assistantContent) {
        await fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            content: assistantContent,
            tokens: Math.ceil(assistantContent.length / 4),
          }),
        });
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex" style={{ height: 'calc(100vh - var(--header-height))' }}>
      {/* Sidebar */}
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
              onClick={() => setSessionId(s.id)}
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

      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  위성 영상 전문 어시스턴트
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  위성 영상 촬영, 가격, 해상도 등에 대해 질문하세요
                </p>
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

        {error && (
          <div
            className="mx-4 mb-2 px-4 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(196, 92, 74, 0.15)',
              border: '1px solid rgba(196, 92, 74, 0.3)',
              color: 'var(--error)',
            }}
          >
            {error}
          </div>
        )}

        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="max-w-3xl mx-auto flex gap-2">
            <textarea
              ref={textareaRef}
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
