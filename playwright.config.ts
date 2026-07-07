import { defineConfig, devices } from '@playwright/test';

const PORT = 3210;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * E2E 配置：对生产构建启动服务，覆盖核心用户路径。
 * 使用独立端口 + 固定 AUTH_SECRET；练习数据走文件持久化（无需数据库）。
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      AUTH_SECRET: 'e2e-secret-abcdefghijklmnop',
      NODE_ENV: 'production',
      ITS_RUNTIME_DIR: '.e2e-runtime',
    },
  },
});
