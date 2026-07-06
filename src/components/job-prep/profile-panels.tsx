import {
  BookText,
  MessageCircleQuestion,
  Route,
  Lightbulb,
  Gauge,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { JobPrepProfile } from '@/types/job';

/** 六项输出中的前五项静态展示（简历追问单独交互）。 */
export function ProfilePanels({ profile }: { profile: JobPrepProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <BookText className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">笔试高频题型</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile.writtenTopics.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Gauge className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">岗位能力模型</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.competencyModel.map((c) => (
            <div key={c.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.weight}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${c.weight}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{c.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <MessageCircleQuestion className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">常见面试问题</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {profile.interviewQuestions.map((q, i) => (
              <li key={q} className="flex gap-2">
                <span className="text-muted-foreground">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Lightbulb className="h-5 w-5 text-warning" />
          <CardTitle className="text-base">备考建议</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {profile.studyAdvice.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="text-warning">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Route className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">推荐练习路径</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            {profile.practicePath.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
                  <span className="text-xs font-semibold">{i + 1}</span>
                  {step}
                </span>
                {i < profile.practicePath.length - 1 ? (
                  <span className="text-muted-foreground">→</span>
                ) : null}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
