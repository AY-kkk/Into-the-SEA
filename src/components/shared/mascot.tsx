import Image from 'next/image';
import { MASCOTS, type MascotPose } from '@/assets/generated';
import { cn } from '@/lib/utils/cn';

const POSE_ALT: Record<MascotPose, string> = {
  wave: '吉祥物向你招手',
  cheer: '吉祥物为你加油',
  success: '吉祥物庆祝成功',
  think: '吉祥物在思考',
};

/** 品牌吉祥物（学士帽小海獭）。四种姿态，主题自适应 SVG。见 docs/DESIGN.md。 */
export function Mascot({
  pose = 'wave',
  size = 96,
  className,
  decorative = false,
}: {
  pose?: MascotPose;
  size?: number;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <Image
      src={MASCOTS[pose]}
      alt={decorative ? '' : POSE_ALT[pose]}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      className={cn('select-none', className)}
      priority={false}
    />
  );
}
