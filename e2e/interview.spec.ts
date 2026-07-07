import { expect, test } from '@playwright/test';

function uniqueEmail(): string {
  return `e2e_iv_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('模拟面试：开场 → 回答 → 生成报告', async ({ page }) => {
  const email = uniqueEmail();

  // 注册（面试接口需登录）
  await page.goto('/register');
  await page.getByLabel('昵称').fill('IV 用户');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill('password123');
  await page.getByRole('button', { name: '注册' }).click();
  await expect(page).toHaveURL('/', { timeout: 15_000 });

  // 进入面试
  await page.goto('/interview');
  await expect(page.getByRole('button', { name: /开始面试/ })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: /开始面试/ }).click();

  // 开场问题出现（聊天气泡）
  await expect(page.getByPlaceholder(/输入你的回答/)).toBeVisible({ timeout: 15_000 });

  // 回答一次
  await page
    .getByPlaceholder(/输入你的回答/)
    .fill('我具备扎实的专业基础与基层服务经历，动机明确。');
  await page.getByRole('button', { name: /发送/ }).click();

  // 结束并生成报告
  await page.getByRole('button', { name: /结束并生成报告/ }).click();

  // 报告出现：综合得分
  await expect(page.getByText('综合得分')).toBeVisible({ timeout: 20_000 });
});
