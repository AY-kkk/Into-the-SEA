/**
 * seedream 素材生成脚本（GOAL.md §10）。
 * 用法：pnpm gen:assets
 *
 * 依赖火山方舟 arkcli（@volcengine/ark-cli，二进制名 `arkcli`）。
 *   安装：npm i -g @volcengine/ark-cli   登录：arkcli auth login（SSO）
 *   本仓库素材即由 arkcli +gen --model doubao-seedream-4-0 真实生成。
 *
 * 行为：
 *   - 检测到 arkcli 且已登录 → 逐项调用 seedream 生成到 raw/，需人工筛选/压缩后落位（见下方 NOTE）。
 *   - 未检测到 arkcli → 打印安装/登录提示并退出 0（不阻塞交付）。
 * 每张素材的 prompt / 用途 / 引用组件见 docs/DESIGN.md「素材登记表」。
 *
 * NOTE(后处理)：seedream 输出为 JPEG，脚本落到 src/assets/generated/raw/；
 *   实际提交的 web 素材经 sips 压缩/缩放后置于 src/assets/generated/<name>.jpg，
 *   文件名需与 src/assets/generated/index.ts 登记一致。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

interface AssetSpec {
  name: string;
  category: 'mascot' | 'state' | 'hero' | 'auth';
  size: string;
  prompt: string;
}

const MODEL = 'doubao-seedream-4-0';
const OUT_DIR = join(process.cwd(), 'src', 'assets', 'generated');
const RAW_DIR = join(OUT_DIR, 'raw');

const STYLE_SUFFIX =
  '。扁平矢量插画风格，主色青绿(#1b5e63)与暖橙(#e07b29)点缀，纯暖纸白(#f7f3ea)背景，' +
  '圆润12-16px圆角，克制柔和的轻投影，禁止刺眼渐变，禁止emoji和文字，专业可信有陪伴感，教育备考产品插画';

const ASSETS: AssetSpec[] = [
  {
    name: 'mascot-wave',
    category: 'mascot',
    size: '1024x1024',
    prompt: '友好的卡通海獭吉祥物，戴深色学士帽，微笑挥手打招呼，正面全身，双手其一举起招手',
  },
  {
    name: 'mascot-cheer',
    category: 'mascot',
    size: '1024x1024',
    prompt: '友好的卡通海獭吉祥物，戴深色学士帽，双手握拳高举做加油鼓励动作，充满干劲的表情',
  },
  {
    name: 'mascot-success',
    category: 'mascot',
    size: '1024x1024',
    prompt: '友好的卡通海獭吉祥物，戴深色学士帽，双手捧起一颗金色五角星庆祝成功，开心的表情',
  },
  {
    name: 'mascot-think',
    category: 'mascot',
    size: '1024x1024',
    prompt:
      '友好的卡通海獭吉祥物，戴深色学士帽，一只手托着下巴思考，头顶有一个问号气泡，好奇的表情',
  },
  {
    name: 'empty-state',
    category: 'state',
    size: '1024x1024',
    prompt: '一个打开的空文件夹与一支放大镜，表示暂无数据的空状态插画，简洁友好，充足留白',
  },
  {
    name: 'loading-state',
    category: 'state',
    size: '1024x1024',
    prompt: '一个圆形加载进度环与三个渐隐的小圆点，表示加载中的插画，简洁',
  },
  {
    name: 'success-state',
    category: 'state',
    size: '1024x1024',
    prompt: '一枚金色奖章绶带与一条向上的增长折线，表示成功完成的插画，克制的庆祝感',
  },
  {
    name: 'error-state',
    category: 'state',
    size: '1024x1024',
    prompt: '一个断开的插头与一个感叹号提示圆点，表示连接出错的插画，柔和的朱红色点缀，不焦虑',
  },
  {
    name: 'hero-exam-news',
    category: 'hero',
    size: '1512x648',
    prompt: '招录情报头图：政务公告栏与多张信息卡片、公文，构图偏左，右侧大面积留白',
  },
  {
    name: 'hero-job-prep',
    category: 'hero',
    size: '1512x648',
    prompt: '岗位备考头图：一个靶心与同心圆能力模型雷达，构图偏左，右侧大面积留白',
  },
  {
    name: 'hero-practice',
    category: 'hero',
    size: '1512x648',
    prompt: '行测刷题头图：一张答题卡与铅笔、若干勾选对号，构图偏左，右侧大面积留白',
  },
  {
    name: 'hero-essay',
    category: 'hero',
    size: '1512x648',
    prompt: '申论案例头图：一叠文稿纸与一支钢笔，几行文字线条，构图偏左，右侧大面积留白',
  },
  {
    name: 'hero-interview',
    category: 'hero',
    size: '1512x648',
    prompt: '模拟面试头图：两个对话气泡一问一答与一枚麦克风，构图偏左，右侧大面积留白',
  },
  {
    name: 'auth-login',
    category: 'auth',
    size: '1024x1280',
    prompt: '海獭吉祥物戴学士帽站在一扇门与一把钥匙旁边，欢迎登录的场景，竖版构图',
  },
  {
    name: 'auth-register',
    category: 'auth',
    size: '1024x1280',
    prompt: '海獭吉祥物戴学士帽微笑挥手，旁边有一个加号徽章，注册加入的欢迎场景，竖版构图',
  },
  {
    name: 'auth-forgot',
    category: 'auth',
    size: '1024x1280',
    prompt: '海獭吉祥物戴学士帽手托下巴思考，旁边有一把钥匙与一把锁，找回密码的场景，竖版构图',
  },
];

function hasArkCli(): boolean {
  try {
    execFileSync('arkcli', ['--version'], { stdio: 'ignore' });
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
      '[gen-assets] 未检测到 arkcli。\n' +
        '安装：npm i -g @volcengine/ark-cli；登录：arkcli auth login。\n' +
        `prompt 清单见 docs/DESIGN.md（共 ${ASSETS.length} 张，已提交生成结果）。`,
    );
    return;
  }

  mkdirSync(RAW_DIR, { recursive: true });
  for (const asset of ASSETS) {
    const prompt = asset.prompt + STYLE_SUFFIX;
    // eslint-disable-next-line no-console
    console.log(`[gen-assets] (${asset.category}) ${asset.name} ${asset.size} …`);
    try {
      execFileSync(
        'arkcli',
        [
          '+gen',
          '--model',
          MODEL,
          '--size',
          asset.size,
          '--watermark=false',
          '--save-to',
          RAW_DIR,
          prompt,
        ],
        { stdio: 'ignore' },
      );
      const produced = readdirSync(RAW_DIR).find((f) => f.startsWith('ark-gen.'));
      if (produced) {
        const ext = produced.split('.').pop() ?? 'jpeg';
        renameSync(join(RAW_DIR, produced), join(RAW_DIR, `${asset.name}.${ext}`));
      }
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`[gen-assets] ${asset.name} 生成失败，可稍后重试。`);
    }
  }
  // eslint-disable-next-line no-console
  console.log(
    `[gen-assets] 完成，输出在 ${RAW_DIR}。\n` +
      '后处理：sips --resampleWidth <w> -s formatOptions 78 raw/<name>.jpeg --out <name>.jpg，' +
      '再更新 index.ts / docs/DESIGN.md（文件名保持一致）。',
  );
}

main();
