import { expect, test } from '@playwright/test';

function uniqueEmail(): string {
  return `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
}

test.describe('核心路径：注册 → 刷题 → 错题本 → 标记掌握', () => {
  test('未登录访问受保护页面会跳转登录', async ({ page }) => {
    await page.goto('/practice');
    await expect(page).toHaveURL(/\/login/);
  });

  test('注册 → 刷题答错入错题本 → 标记已掌握（完整闭环）', async ({ page }) => {
    const email = uniqueEmail();

    // 注册
    await page.goto('/register');
    await page.getByLabel('昵称').fill('E2E 用户');
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '注册' }).click();
    await expect(page).toHaveURL('/', { timeout: 15_000 });

    // 进入刷题并开始「顺序练习」
    await page.goto('/practice');
    await expect(page.getByRole('button', { name: '开始练习' })).toBeVisible();
    await page.getByRole('button', { name: '开始', exact: true }).first().click();

    // 等待题目出现
    await expect(page.locator('text=/第 1 \\/ \\d+ 题/')).toBeVisible({ timeout: 15_000 });

    // 逐题作答，选项固定选 A（约 75% 概率答错），制造至少一道错题
    let producedWrong = false;
    for (let i = 0; i < 12 && !producedWrong; i++) {
      // 选项按钮：以 A/B/C/D 开头
      await page.getByRole('button', { name: /^A/ }).first().click();
      // 判断是否答错（错误时展示「回答错误，已加入错题本」）
      if (await page.getByText('回答错误').count()) producedWrong = true;
      // 进入下一题或完成
      const nextBtn = page.getByRole('button', { name: /下一题|完成/ });
      if (await nextBtn.count()) await nextBtn.first().click();
    }

    expect(producedWrong).toBeTruthy();

    // 退出练习，回到刷题主视图
    const exitBtn = page.getByRole('button', { name: /退出练习|返回/ });
    if (await exitBtn.count()) await exitBtn.first().click();

    // 打开错题本 tab
    await page.getByRole('button', { name: /错题本/ }).click();

    // 错题本应至少有一条，含「已掌握/掌握」按钮，点击标记掌握
    const masterBtn = page.getByRole('button', { name: /掌握/ });
    await expect(masterBtn.first()).toBeVisible({ timeout: 10_000 });
    await masterBtn.first().click();
  });
});
