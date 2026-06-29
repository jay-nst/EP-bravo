// LLM Provider abstraction
// Set LLM_PROVIDER=bedrock in .env to use AWS Bedrock
// Default: gemini (free tier)

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamChatParams {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}

interface InvokeChatResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

export async function streamChat(
  params: StreamChatParams,
): Promise<ReadableStream<Uint8Array>> {
  const provider = process.env.LLM_PROVIDER || 'gemini';

  if (provider === 'bedrock') {
    const { streamBedrockChat } = await import('./bedrock');
    return streamBedrockChat(params);
  }

  const { streamGeminiChat } = await import('./gemini');
  return streamGeminiChat(params);
}

export async function invokeChat(
  params: StreamChatParams,
): Promise<InvokeChatResult> {
  const provider = process.env.LLM_PROVIDER || 'gemini';

  if (provider === 'bedrock') {
    const { invokeBedrockChat } = await import('./bedrock');
    return invokeBedrockChat(params);
  }

  const { invokeGeminiChat } = await import('./gemini');
  return invokeGeminiChat(params);
}
