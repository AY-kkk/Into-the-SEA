import { NextResponse, type NextRequest } from 'next/server';
import { examInfoFilterSchema } from '@/lib/validators/exam';
import { listExamInfo } from '@/services/exam-info.service';

/**
 * GET /api/exam-news — 招录情报列表。
 * 查询参数经 zod 校验；provider 失败时返回 502 并给出可读错误。
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const raw = Object.fromEntries(searchParams.entries());
  const parsed = examInfoFilterSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const items = await listExamInfo(parsed.data);
    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '数据源暂时不可用', message }, { status: 502 });
  }
}
