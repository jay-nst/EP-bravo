// Google Gemini free-tier client for chat
// Switch to Bedrock by setting LLM_PROVIDER=bedrock in .env

interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function streamGeminiChat(params: {
  system: string;
  messages: GeminiMessage[];
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const modelId = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: params.system,
  });

  // Convert message history to Gemini format
  const history = params.messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }));

  const lastMessage = params.messages[params.messages.length - 1];

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: params.maxTokens || 1024,
    },
  });

  const result = await chat.sendMessageStream(lastMessage.content);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
            );
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'Stream error' })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });
}

// Non-streaming version
export async function invokeGeminiChat(params: {
  system: string;
  messages: GeminiMessage[];
  maxTokens?: number;
}): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const modelId = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: params.system,
  });

  const history = params.messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }));

  const lastMessage = params.messages[params.messages.length - 1];

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: params.maxTokens || 1024,
    },
  });

  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;
  const usage = response.usageMetadata;

  return {
    content: response.text() || '',
    inputTokens: usage?.promptTokenCount || 0,
    outputTokens: usage?.candidatesTokenCount || 0,
  };
}
