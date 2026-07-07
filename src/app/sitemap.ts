import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/** sitemap：可被搜索收录的公开页面（招录情报、申论案例等）。 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ['', '/exam-news', '/essay', '/job-prep', '/practice', '/interview'];
  return routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/exam-news' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
}
