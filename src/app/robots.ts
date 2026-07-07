import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/** robots.txt：公开页面可收录，鉴权/接口/个人数据路径禁止收录。 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/login', '/register', '/forgot-password'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
