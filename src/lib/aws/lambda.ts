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

export async function invokeLambdaClip(params: ClipRequest): Promise<ClipResult> {
  const region = process.env.AWS_REGION || 'ap-northeast-2';
  const functionName = process.env.CLIP_LAMBDA_FUNCTION_NAME || 'earthpaper-clip';

  // Dynamic import to avoid bundling AWS SDK in client
  const { LambdaClient, InvokeCommand } = await import('@aws-sdk/client-lambda');

  const client = new LambdaClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: 'RequestResponse',
    Payload: new TextEncoder().encode(JSON.stringify(params)),
  });

  const response = await client.send(command);

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
}
