import { expect, test } from '@playwright/test';

function uniqueEmail(): string {
  return `e2e_bill_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('商业化：注册(免费) → 升级专业版 → 当前套餐更新', async ({ page }) => {
  const email = uniqueEmail();

  await page.goto('/register');
  await page.getByLabel('昵称').fill('Bill 用户');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill('password123');
  await page.getByRole('button', { name: '注册' }).click();
  await expect(page).toHaveURL('/', { timeout: 15_000 });

  await page.goto('/pricing');
  // 专业版卡片的升级按钮
  const upgrade = page.getByRole('button', { name: /升级到专业版/ });
  await expect(upgrade).toBeVisible({ timeout: 15_000 });
  await upgrade.click();

  // 升级后专业版应显示「已订阅」
  await expect(page.getByRole('button', { name: '已订阅' })).toBeVisible({ timeout: 15_000 });
});
