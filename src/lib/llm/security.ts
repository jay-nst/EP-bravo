// F8: LLM Security Triple Defense
// 1. Input length limit (2,000 chars)
// 2. System prompt isolation (user cannot override)
// 3. Catalog API verification (LLM tool calls go through validated API only)

const MAX_INPUT_LENGTH = 2000;

const BLOCKED_PATTERNS = [
  /ignore\s+(previous|all|above)\s+instructions/i,
  /system\s*prompt/i,
  /you\s+are\s+now/i,
  /forget\s+(everything|all|your)/i,
  /new\s+instructions/i,
  /override\s+(system|instructions)/i,
  /act\s+as\s+(?!a\s+satellite)/i,
  /pretend\s+you/i,
  /jailbreak/i,
  /DAN\s+mode/i,
];

export interface SecurityCheckResult {
  safe: boolean;
  error?: string;
}

export function validateUserInput(input: string): SecurityCheckResult {
  // Defense 1: Length limit
  if (input.length > MAX_INPUT_LENGTH) {
    return {
      safe: false,
      error: `메시지가 너무 깁니다 (최대 ${MAX_INPUT_LENGTH}자, 현재 ${input.length}자)`,
    };
  }

  if (input.trim().length === 0) {
    return { safe: false, error: '빈 메시지는 전송할 수 없습니다' };
  }

  // Defense 2: Prompt injection detection
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      return {
        safe: false,
        error: '허용되지 않는 메시지 패턴이 감지되었습니다',
      };
    }
  }

  return { safe: true };
}

// Defense 3: System prompt isolation
// The system prompt is hardcoded and never exposed to or modifiable by the user
export function getSystemPrompt(): string {
  return `당신은 EarthPaper의 위성 영상 상담 AI입니다.

역할:
- 사용자가 적합한 위성 영상을 찾을 수 있도록 도와줍니다
- 영상 카탈로그를 검색하고 결과를 설명합니다
- 위성 영상의 해상도, 가격, 촬영 조건 등에 대해 안내합니다

사용 가능한 위성:
- Observer: 해상도 1.5m (초해상도 1m), $7/km², 최소 주문 1km²
- SpaceEye-T: 해상도 25cm (초해상도 8.3cm), $15/km², 최소 주문 25km²

규칙:
- 카탈로그에 없는 영상은 추천하지 마세요
- 가격 정보는 정확히 전달하세요
- 위성 영상과 관련 없는 질문에는 정중히 거절하세요
- 한국어로 응답하세요
- 응답은 간결하게 유지하세요`;
}
