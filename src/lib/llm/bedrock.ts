// AWS Bedrock Claude client for chat
// Uses Claude claude-sonnet-4-6 via Bedrock InvokeModelWithResponseStream

interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BedrockStreamChunk {
  type: string;
  delta?: { type: string; text?: string };
}

export async function streamBedrockChat(params: {
  system: string;
  messages: BedrockMessage[];
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const {
    BedrockRuntimeClient,
    InvokeModelWithResponseStreamCommand,
  } = await import('@aws-sdk/client-bedrock-runtime');

  const region = process.env.AWS_BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1';
  const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-sonnet-4-6-20250514-v1:0';

  const client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: params.maxTokens || 1024,
    system: params.system,
    messages: params.messages,
  });

  const command = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        if (response.body) {
          for await (const event of response.body) {
            if (event.chunk?.bytes) {
              const json = JSON.parse(
                new TextDecoder().decode(event.chunk.bytes),
              ) as BedrockStreamChunk;

              if (
                json.type === 'content_block_delta' &&
                json.delta?.type === 'text_delta' &&
                json.delta.text
              ) {
                // SSE format
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: json.delta.text })}\n\n`),
                );
              }
            }
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

// Non-streaming version for tool use / short responses
export async function invokeBedrockChat(params: {
  system: string;
  messages: BedrockMessage[];
  maxTokens?: number;
}): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const { BedrockRuntimeClient, InvokeModelCommand } = await import(
    '@aws-sdk/client-bedrock-runtime'
  );

  const region = process.env.AWS_BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1';
  const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-sonnet-4-6-20250514-v1:0';

  const client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: params.maxTokens || 1024,
    system: params.system,
    messages: params.messages,
  });

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));

  return {
    content: result.content?.[0]?.text || '',
    inputTokens: result.usage?.input_tokens || 0,
    outputTokens: result.usage?.output_tokens || 0,
  };
}
