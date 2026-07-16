import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generatePresignedUrl } from '@/lib/aws/s3';
import { requireAuth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { userId, supabase } = auth.user;

  // Fetch download record
  const { data: download, error: dlError } = await supabase
    .from('downloads')
    .select('*')
    .eq('order_id', orderId)
    .eq('user_id', userId)
    .single();

  if (dlError || !download) {
    return NextResponse.json(
      { error: '다운로드 정보를 찾을 수 없습니다' },
      { status: 404 },
    );
  }

  // Check expiry
  if (new Date(download.expires_at) < new Date()) {
    return NextResponse.json(
      { error: '다운로드 기간이 만료되었습니다' },
      { status: 410 },
    );
  }

  // Generate presigned URL from S3
  const fileUrl = download.file_url;

  // Parse S3 URL: s3://bucket/key
  const s3Match = fileUrl.match(/^s3:\/\/([^/]+)\/(.+)$/);
  if (!s3Match) {
    return NextResponse.json(
      { error: '파일 URL 형식이 올바르지 않습니다' },
      { status: 500 },
    );
  }

  const [, bucket, key] = s3Match;
  const presignedUrl = await generatePresignedUrl(bucket, key, 3600);

  // Mark as downloaded
  const admin = createAdminClient();
  await admin
    .from('downloads')
    .update({ downloaded: true })
    .eq('id', download.id);

  return NextResponse.json({ url: presignedUrl });
}
