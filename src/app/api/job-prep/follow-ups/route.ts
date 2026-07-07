import { NextResponse, type NextRequest } from 'next/server';
import { guard } from '@/lib/security/guard';
import { followUpsSchema } from '@/lib/validators/job';
import { generateResumeFollowUps } from '@/services/job-prep.service';
import { moderate } from '@/lib/moderation';

/** POST /api/job-prep/follow-ups — 根据简历要点生成针对性追问。 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const g = await guard(request, { requireAuth: true });
  if (!g.ok) return g.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }
  const parsed = followUpsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  // 简历文本输入审核：违规拦截，PII 脱敏。
  const safe = await moderate(parsed.data.resumeText);
  if (safe.action === 'block') {
    return NextResponse.json(
      { error: '简历内容包含不适当信息，请修改后重试', categories: safe.categories },
      { status: 422 },
    );
  }
  const followUps = generateResumeFollowUps(safe.text, parsed.data.positionName);
  return NextResponse.json({ followUps });
}
