import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * 来源链接组件 —— source_url 红线：任何含外部来源的卡片都必须展示。
 */
export function SourceLink({
  url,
  name,
  className,
}: {
  url: string;
  name?: string;
  className?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline',
        className,
      )}
    >
      <ExternalLink className="h-3.5 w-3.5" />
      {name ?? '查看来源'}
    </a>
  );
}
