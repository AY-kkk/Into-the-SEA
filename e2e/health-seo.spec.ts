import { expect, test } from '@playwright/test';

test('健康检查端点返回 ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe('ok');
});

test('robots.txt 与 sitemap.xml 可访问', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('Sitemap');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain('/exam-news');
});

test('未登录访问受保护 API 返回 401', async ({ request }) => {
  const res = await request.get('/api/practice/state');
  expect(res.status()).toBe(401);
});
