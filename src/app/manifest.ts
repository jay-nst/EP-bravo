import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EarthPaper - 위성 영상 셀프서비스',
    short_name: 'EarthPaper',
    description:
      'Observer, SpaceEye-T 위성 영상을 AOI 기반으로 검색, 클리핑, 즉시 다운로드',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#030712',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
