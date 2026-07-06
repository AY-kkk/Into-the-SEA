import {
  LayoutDashboard,
  Newspaper,
  Target,
  ListChecks,
  PenLine,
  MessagesSquare,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** Five core modules + dashboard. Single source of truth for routing/navigation. */
export const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: '首页',
    description: '今日动态与备考总览',
    icon: LayoutDashboard,
  },
  {
    href: '/exam-news',
    label: '招录情报',
    description: '国考 / 省考 / 国企招录信息',
    icon: Newspaper,
  },
  {
    href: '/job-prep',
    label: '岗位备考',
    description: '岗位能力模型与简历追问',
    icon: Target,
  },
  {
    href: '/practice',
    label: '行测刷题',
    description: '五大题型与错题本',
    icon: ListChecks,
  },
  {
    href: '/essay',
    label: '申论案例',
    description: '优秀案例与历年原题',
    icon: PenLine,
  },
  {
    href: '/interview',
    label: '模拟面试',
    description: 'AI 面试官与结构化反馈',
    icon: MessagesSquare,
  },
];
