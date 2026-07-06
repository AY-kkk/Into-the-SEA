import { CalendarDays, GraduationCap, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SourceLink } from '@/components/shared/source-link';
import { formatDate } from '@/lib/utils';
import {
  EDUCATION_LABELS,
  ENROLL_STATUS_LABELS,
  EXAM_CATEGORY_LABELS,
  type ExamInfo,
} from '@/types';

const STATUS_VARIANT: Record<ExamInfo['status'], 'success' | 'warning' | 'secondary'> = {
  open: 'success',
  upcoming: 'warning',
  closed: 'secondary',
};

export function ExamCard({ item }: { item: ExamInfo }) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{EXAM_CATEGORY_LABELS[item.category]}</Badge>
          <Badge variant={STATUS_VARIANT[item.status]}>{ENROLL_STATUS_LABELS[item.status]}</Badge>
        </div>
        <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{item.organization}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>

        <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {item.region}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> 招录 {item.headcount.toLocaleString()} 人
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" /> {EDUCATION_LABELS[item.education]}起
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(item.enrollStart)}–{formatDate(item.enrollEnd)}
          </div>
        </dl>

        <div className="flex flex-wrap gap-1.5">
          {item.majors.slice(0, 3).map((m) => (
            <Badge key={m} variant="secondary" className="font-normal">
              {m}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">
            {item.examDate ? `笔试 ${formatDate(item.examDate)}` : '笔试待定'}
          </span>
          {/* source_url 红线：必须展示 */}
          <SourceLink url={item.sourceUrl} name={item.sourceName ?? '查看来源'} />
        </div>
      </CardContent>
    </Card>
  );
}
