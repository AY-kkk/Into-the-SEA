import { Award, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { InterviewReport } from '@/types/interview';

export function ReportView({ report }: { report: InterviewReport }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl font-bold text-primary">{report.overallScore}</span>
          </div>
          <p className="text-sm font-medium">综合得分</p>
          <p className="max-w-xl text-sm text-muted-foreground">{report.summary}</p>
        </CardContent>
      </Card>

      {report.scores.length ? (
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">分维度评分</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.scores.map((s) => (
              <div key={s.dimension} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.dimension}</span>
                  <span className="text-xs text-muted-foreground">{s.score}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${s.score}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{s.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <TrendingUp className="h-5 w-5 text-success" />
            <CardTitle className="text-base">优势亮点</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {report.strengths.length ? (
              report.strengths.map((s) => (
                <Badge key={s} variant="success">
                  {s}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">暂无</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <AlertCircle className="h-5 w-5 text-warning" />
            <CardTitle className="text-base">提升建议</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {report.improvements.length ? (
                report.improvements.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-warning">•</span>
                    <span>{s}</span>
                  </li>
                ))
              ) : (
                <li>暂无</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
