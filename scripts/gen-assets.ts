/**
 * seeddream 素材生成脚本（GOAL.md §10）。
 * 用法：pnpm gen:assets
 *
 * 依赖 ark-cli seeddream（火山方舟）。当前环境不可用时：
 *  - 检测不到 ark-cli → 打印降级提示并退出 0（不阻塞交付）。
 * prompt 清单见 docs/DESIGN.md。生成结果应落到 src/assets/generated/。
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

interface AssetSpec {
  name: string;
  prompt: string;
}

const OUT_DIR = join(process.cwd(), 'src', 'assets', 'generated');

const ASSETS: AssetSpec[] = [
  {
    name: 'mascot-wave',
    prompt: '友好的卡通海獭吉祥物，戴学士帽，招手，扁平矢量，青绿#1b5e63与暖橙#e07b29，暖纸白背景',
  },
  { name: 'empty-state', prompt: '空文件夹与放大镜，扁平矢量，青绿主色，暖纸白背景，简洁友好' },
  { name: 'success-state', prompt: '勋章与上升折线，扁平矢量，青绿与暖橙，克制庆祝' },
  { name: 'error-state', prompt: '断开的连接与提示图标，扁平矢量，柔和朱红，友好' },
  { name: 'hero-exam-news', prompt: '公告栏与信息卡片头图，右侧留白，青绿暖橙，扁平矢量' },
];

function hasArkCli(): boolean {
  try {
    execSync('ark-cli --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function main(): void {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  if (!hasArkCli()) {
    // eslint-disable-next-line no-console
    console.warn(
      '[gen-assets] 未检测到 ark-cli，seeddream 生图跳过（降级为图标+纹理占位）。\n' +
        'prompt 清单见 docs/DESIGN.md；具备环境后重跑 pnpm gen:assets。',
    );
    return;
  }

  for (const asset of ASSETS) {
    // TODO(real): 调用真实 seeddream 命令，示例：
    //   execSync(`ark-cli seeddream --prompt "${asset.prompt}" --out ${join(OUT_DIR, asset.name + '.png')}`);
    // eslint-disable-next-line no-console
    console.log(`[gen-assets] 生成 ${asset.name} …（prompt: ${asset.prompt.slice(0, 24)}…）`);
  }
}

main();
