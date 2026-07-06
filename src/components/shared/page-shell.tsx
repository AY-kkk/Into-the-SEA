import { cn } from '@/lib/utils/cn';

interface PageShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Consistent page wrapper with heading + optional actions. */
export function PageShell({ title, description, actions, children, className }: PageShellProps) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl space-y-6 p-4 lg:p-8', className)}>
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
