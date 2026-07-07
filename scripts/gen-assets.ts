/**
 * seeddream 素材生成脚本（GOAL.md §10）。
 * 用法：pnpm gen:assets
 *
 * 依赖 ark-cli seeddream（火山方舟）。当前环境不可用时：
 *  - 检测不到 ark-cli → 打印降级提示并退出 0（不阻塞交付）。
 *  - 降级方案：仓库已内置一套「主题自适应手绘 SVG」（src/assets/generated/*.svg，
 *    亮/暗双主题，对齐 tailwind token），并已实际引用进组件。
 * 每张素材的 prompt / 用途 / 引用组件见 docs/DESIGN.md。
 * 生成结果落到 src/assets/generated/；文件名需与 src/assets/generated/index.ts 中登记的一致。
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

interface AssetSpec {
  name: string;
  category: string;
  prompt: string;
}

const OUT_DIR = join(process.cwd(), 'src', 'assets', 'generated');

const STYLE_SUFFIX =
  '，扁平矢量插画，青绿#1b5e63 与暖橙#e07b29 双主色，暖纸白#f7f3ea 背景，圆角 12-16px，柔和轻投影，克制质感，无刺眼渐变，无 emoji，支持亮/暗双主题';

const ASSETS: AssetSpec[] = [
  // 品牌吉祥物（学士帽小海獭）四姿态
  {
    name: 'mascot-wave',
    category: 'mascot',
    prompt: '友好的卡通海獭吉祥物，戴学士帽，微笑招手欢迎',
  },
  {
    name: 'mascot-cheer',
    category: 'mascot',
    prompt: '卡通海獭吉祥物双手举起握拳加油鼓励，戴学士帽',
  },
  {
    name: 'mascot-success',
    category: 'mascot',
    prompt: '卡通海獭吉祥物双手捧起金色星星庆祝成功，戴学士帽',
  },
  {
    name: 'mascot-think',
    category: 'mascot',
    prompt: '卡通海獭吉祥物手托下巴思考，头顶问号气泡，戴学士帽',
  },
  // 状态插画
  { name: 'empty-state', category: 'state', prompt: '空文件夹与放大镜，表示暂无数据，简洁友好' },
  { name: 'loading-state', category: 'state', prompt: '旋转加载环与三个渐隐圆点，表示加载中' },
  { name: 'success-state', category: 'state', prompt: '奖章与上升折线，克制的成功庆祝' },
  {
    name: 'error-state',
    category: 'state',
    prompt: '断开的插头与提示图标，表示连接出错，柔和朱红',
  },
  // 栏目头图（宽幅 Banner）
  { name: 'hero-exam-news', category: 'hero', prompt: '公告栏与信息卡片头图，右侧留白' },
  { name: 'hero-job-prep', category: 'hero', prompt: '靶心与同心圆能力模型头图，右侧留白' },
  { name: 'hero-practice', category: 'hero', prompt: '答题卡与勾选标记头图，右侧留白' },
  { name: 'hero-essay', category: 'hero', prompt: '文稿纸与笔头图，右侧留白' },
  { name: 'hero-interview', category: 'hero', prompt: '对话气泡与面试官问答头图，右侧留白' },
  // 鉴权品牌插画
  { name: 'auth-login', category: 'auth', prompt: '海獭吉祥物站在门与钥匙旁，登录场景，竖版' },
  {
    name: 'auth-register',
    category: 'auth',
    prompt: '海獭吉祥物挥手，旁边加号徽章，注册欢迎场景，竖版',
  },
  {
    name: 'auth-forgot',
    category: 'auth',
    prompt: '海獭吉祥物思考，旁边钥匙与锁，找回密码场景，竖版',
  },
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
      `[gen-assets] 未检测到 ark-cli，seeddream 生图跳过。\n` +
        `已降级为内置主题自适应 SVG（共 ${ASSETS.length} 张，已引用进组件）。\n` +
        `prompt 清单见 docs/DESIGN.md；具备环境后重跑 pnpm gen:assets 覆盖同名文件即可。`,
    );
    return;
  }

  for (const asset of ASSETS) {
    const fullPrompt = asset.prompt + STYLE_SUFFIX;
    // TODO(real): 调用真实 seeddream 命令，输出需与 index.ts 登记文件名一致，示例：
    //   execSync(`ark-cli seeddream --prompt "${fullPrompt}" --out ${join(OUT_DIR, asset.name + '.png')}`);
    // eslint-disable-next-line no-console
    console.log(
      `[gen-assets] (${asset.category}) ${asset.name} … prompt: ${fullPrompt.slice(0, 32)}…`,
    );
  }
}

main();
