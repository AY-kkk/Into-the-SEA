import { FileText, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SourceLink } from '@/components/shared/source-link';
import { EXAM_CATEGORY_LABELS } from '@/types/common';
import {
  ESSAY_QUESTION_TYPE_LABELS,
  ESSAY_TOPIC_LABELS,
  type EssayOriginal,
} from '@/types/essay';

export function OriginalCard({ item }: { item: EssayOriginal }) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="default">{item.year} 年</Badge>
          <Badge variant="secondary">{EXAM_CATEGORY_LABELS[item.category]}</Badge>
          <Badge variant="outline">{ESSAY_QUESTION_TYPE_LABELS[item.questionType]}</Badge>
        </div>
        <CardTitle className="flex items-start gap-2 text-base leading-snug">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="line-clamp-3">{item.prompt}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">材料摘要：</span>
          {item.materialSummary}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {item.region}
          </span>
          {item.topics.map((t) => (
            <Badge key={t} variant="accent" className="font-normal">
              {ESSAY_TOPIC_LABELS[t]}
            </Badge>
          ))}
        </div>
        <div className="mt-auto border-t pt-3">
          {/* source_url 红线：必须展示 */}
          <SourceLink url={item.sourceUrl} name={item.sourceName ?? '查看来源'} />
        </div>
      </CardContent>
    </Card>
  );
}
