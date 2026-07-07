import Image from 'next/image';
import { AUTH_ART } from '@/assets/generated';

type AuthArtKey = keyof typeof AUTH_ART;

/** 鉴权卡片：顶部品牌插画 + 标题 + 表单内容。素材见 docs/DESIGN.md（auth-*）。 */
export function AuthCard({
  art,
  title,
  description,
  children,
  footer,
}: {
  art: AuthArtKey;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src={AUTH_ART[art]}
          alt=""
          aria-hidden
          width={260}
          height={220}
          className="h-32 w-auto"
        />
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {children}
      {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}
