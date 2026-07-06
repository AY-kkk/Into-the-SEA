import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/** Milestone placeholder — replaced module-by-module per GOAL.md roadmap. */
export function ModulePlaceholder({ milestone, note }: { milestone: string; note: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="bg-accent/12 flex h-12 w-12 items-center justify-center rounded-full text-accent">
          <Construction className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium">该模块将在里程碑 {milestone} 落地</p>
        <p className="max-w-md text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}
