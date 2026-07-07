import { expect, test } from '@playwright/test';

function uniqueEmail(): string {
  return `e2e_exp_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
}

async function register(page: import('@playwright/test').Page, email: string) {
  await page.goto('/register');
  await page.getByLabel('昵称').fill('Exp 用户');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill('password123');
  await page.getByRole('button', { name: '注册' }).click();
  await expect(page).toHaveURL('/', { timeout: 15_000 });
}

test('导出门控：免费用户在错题本看到「专业版」锁，升级后变为可导出', async ({ page }) => {
  const email = uniqueEmail();
  await register(page, email);

  // 制造一道错题
  await page.goto('/practice');
  await page.getByRole('button', { name: '开始', exact: true }).first().click();
  await expect(page.locator('text=/第 1 \\/ \\d+ 题/')).toBeVisible({ timeout: 15_000 });
  let wrong = false;
  for (let i = 0; i < 12 && !wrong; i++) {
    await page.getByRole('button', { name: /^A/ }).first().click();
    if (await page.getByText('回答错误').count()) wrong = true;
    const next = page.getByRole('button', { name: /下一题|完成/ });
    if (await next.count()) await next.first().click();
  }
  expect(wrong).toBeTruthy();
  const exit = page.getByRole('button', { name: /退出练习|返回/ });
  if (await exit.count()) await exit.first().click();
  await page.getByRole('button', { name: /错题本/ }).click();

  // 免费用户：锁定的专业版导出入口
  await expect(page.getByRole('link', { name: /导出（专业版）/ })).toBeVisible({ timeout: 10_000 });

  // 升级专业版
  await page.goto('/pricing');
  await page.getByRole('button', { name: /升级到专业版/ }).click();
  await expect(page.getByRole('button', { name: '已订阅' })).toBeVisible({ timeout: 15_000 });

  // 回到错题本：现在应出现可用的导出按钮
  await page.goto('/practice');
  await page.getByRole('button', { name: /错题本/ }).click();
  await expect(page.getByRole('button', { name: /导出错题本/ })).toBeVisible({ timeout: 10_000 });
});
