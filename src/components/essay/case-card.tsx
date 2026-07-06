import { Lightbulb, Quote, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SourceLink } from '@/components/shared/source-link';
import { ESSAY_TOPIC_LABELS, type EssayCase } from '@/types/essay';

export function CaseCard({ item }: { item: EssayCase }) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {item.topics.map((t) => (
            <Badge key={t} variant="accent">
              {ESSAY_TOPIC_LABELS[t]}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-muted-foreground">{item.summary}</p>

        <div className="space-y-2 rounded-lg bg-secondary/50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Quote className="h-3.5 w-3.5 text-accent" /> 可迁移表达
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {item.transferableExpressions.map((e) => (
              <li key={e} className="leading-relaxed">
                「{e}」
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>适用：{item.applicableTopics.join(' · ')}</span>
        </div>
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <span>场景：{item.usageScenarios.join(' · ')}</span>
        </div>

        <div className="mt-auto border-t pt-3">
          {/* source_url 红线：必须展示 */}
          <SourceLink url={item.sourceUrl} name={item.sourceName ?? '查看来源'} />
        </div>
      </CardContent>
    </Card>
  );
}
