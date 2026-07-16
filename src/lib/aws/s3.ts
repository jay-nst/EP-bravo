// S3 presigned URL generation for download

let cachedClient: InstanceType<typeof import('@aws-sdk/client-s3').S3Client> | null = null;

async function getS3Client() {
  if (cachedClient) return cachedClient;

  const { S3Client } = await import('@aws-sdk/client-s3');
  const region = process.env.AWS_REGION || 'ap-northeast-2';

  cachedClient = new S3Client({ region });
  return cachedClient;
}

export async function generatePresignedUrl(
  bucket: string,
  key: string,
  expiresInSeconds: number = 3600,
): Promise<string> {
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const client = await getS3Client();
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}
