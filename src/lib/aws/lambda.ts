// AWS Lambda clipping invocation
// Calls the earthpaper-clip Lambda function to clip COG by AOI

interface ClipRequest {
  cogUrl: string;
  aoi: GeoJSON.Polygon;
  outputBucket: string;
  outputKey: string;
}

interface ClipResult {
  success: boolean;
  outputUrl: string | null;
  fileSize: number | null;
  error: string | null;
}

let cachedClient: InstanceType<typeof import('@aws-sdk/client-lambda').LambdaClient> | null = null;

async function getLambdaClient() {
  if (cachedClient) return cachedClient;

  const { LambdaClient } = await import('@aws-sdk/client-lambda');
  const region = process.env.AWS_REGION || 'ap-northeast-2';

  cachedClient = new LambdaClient({ region });
  return cachedClient;
}

const LAMBDA_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;
const RETRYABLE_ERRORS = new Set(['TooManyRequestsException', 'ServiceException', 'EC2ThrottledException']);

export async function invokeLambdaClip(params: ClipRequest): Promise<ClipResult> {
  const functionName = process.env.CLIP_LAMBDA_FUNCTION_NAME || 'earthpaper-clip';

  const { InvokeCommand } = await import('@aws-sdk/client-lambda');
  const client = await getLambdaClient();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LAMBDA_TIMEOUT_MS);

      const command = new InvokeCommand({
        FunctionName: functionName,
        InvocationType: 'RequestResponse',
        Payload: new TextEncoder().encode(JSON.stringify(params)),
      });

      const response = await client.send(command, { abortSignal: controller.signal });
      clearTimeout(timeout);

      if (response.FunctionError) {
        const errorPayload = response.Payload
          ? JSON.parse(new TextDecoder().decode(response.Payload))
          : { errorMessage: 'Unknown Lambda error' };
        return {
          success: false,
          outputUrl: null,
          fileSize: null,
          error: errorPayload.errorMessage || 'Lambda clipping failed',
        };
      }

      const payload = response.Payload
        ? JSON.parse(new TextDecoder().decode(response.Payload))
        : null;

      if (!payload || !payload.outputUrl) {
        return {
          success: false,
          outputUrl: null,
          fileSize: null,
          error: 'Invalid Lambda response',
        };
      }

      return {
        success: true,
        outputUrl: payload.outputUrl,
        fileSize: payload.fileSize || null,
        error: null,
      };
    } catch (err: unknown) {
      const errorName = err instanceof Error ? err.name : '';
      const isRetryable = RETRYABLE_ERRORS.has(errorName) || errorName === 'AbortError';

      if (isRetryable && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }

      return {
        success: false,
        outputUrl: null,
        fileSize: null,
        error: errorName === 'AbortError'
          ? `Lambda timeout (${LAMBDA_TIMEOUT_MS}ms)`
          : `Lambda invocation failed: ${err instanceof Error ? err.message : 'Unknown'}`,
      };
    }
  }

  return {
    success: false,
    outputUrl: null,
    fileSize: null,
    error: 'Lambda invocation failed after retries',
  };
}
