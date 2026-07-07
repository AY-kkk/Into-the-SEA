import Image from 'next/image';
import { MODULE_HERO, type ModuleHeroKey } from '@/assets/generated';

/** 栏目头图 Banner（每个模块 1 套）。素材见 docs/DESIGN.md（hero-*）。 */
export function ModuleHero({ moduleKey }: { moduleKey: ModuleHeroKey }) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <Image
        src={MODULE_HERO[moduleKey]}
        alt=""
        aria-hidden
        className="h-24 w-full object-cover sm:h-28"
        priority
      />
    </div>
  );
}
