import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { ExamInfoFreshness } from '@/services/exam-info.service';

/** 招录数据新鲜度提示：展示更新时间；数据陈旧时给出提醒。 */
export function FreshnessBanner({ freshness }: { freshness: ExamInfoFreshness }) {
  const updated = freshness.latestPublishedAt ? formatDate(freshness.latestPublishedAt) : '未知';
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
      <Clock className="h-3.5 w-3.5" />
      <span>数据更新时间：{updated}</span>
      {freshness.ageDays !== null ? <span>· {freshness.ageDays} 天前</span> : null}
      {freshness.lastIngestAt ? <span>· 最近同步 {formatDate(freshness.lastIngestAt)}</span> : null}
      {freshness.stale ? (
        <Badge variant="warning">数据可能已过期，请以官方公告为准</Badge>
      ) : (
        <Badge variant="success">较新</Badge>
      )}
    </div>
  );
}
