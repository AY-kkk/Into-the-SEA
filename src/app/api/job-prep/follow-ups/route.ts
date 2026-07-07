import { NextResponse, type NextRequest } from 'next/server';
import { guard } from '@/lib/security/guard';
import { followUpsSchema } from '@/lib/validators/job';
import { generateResumeFollowUps } from '@/services/job-prep.service';

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
  const followUps = generateResumeFollowUps(parsed.data.resumeText, parsed.data.positionName);
  return NextResponse.json({ followUps });
}
