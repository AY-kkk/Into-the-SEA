import { cn } from '@/lib/utils/cn';
import { ModuleHero } from '@/components/shared/module-hero';
import type { ModuleHeroKey } from '@/assets/generated';

interface PageShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** 栏目头图 key；提供时在标题上方渲染 seeddream 头图 Banner。 */
  heroKey?: ModuleHeroKey;
}

/** Consistent page wrapper with optional hero banner + heading + actions. */
export function PageShell({
  title,
  description,
  actions,
  children,
  className,
  heroKey,
}: PageShellProps) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl space-y-6 p-4 lg:p-8', className)}>
      {heroKey ? <ModuleHero moduleKey={heroKey} /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
