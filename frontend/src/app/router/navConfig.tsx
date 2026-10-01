import {
  BarChart3,
  Bell,
  GitMerge,
  Globe,
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Warehouse,
} from 'lucide-react'
import type { WorkspaceConfig } from '@/types/nav'

export const dealerWorkspace: WorkspaceConfig = {
  role: 'dealer',
  label: 'Dai ly',
  displayName: 'Dai ly / Don vi',
  homePath: '/dealer/dashboard',
  sections: [
    {
      items: [
        { label: 'Tong quan', to: '/dealer/dashboard', icon: LayoutDashboard },
        { label: 'Du bao nhu cau', to: '/dealer/forecast', icon: TrendingUp },
        { label: 'Ton kho', to: '/dealer/inventory', icon: Warehouse },
        { label: 'Yeu cau bo sung', to: '/dealer/requests', icon: Bell },
      ],
    },
  ],
}

export const scmWorkspace: WorkspaceConfig = {
  role: 'scm',
  label: 'SCM',
  displayName: 'Quan ly Chuoi cung ung',
  homePath: '/scm/dashboard',
  sections: [
    {
      items: [
        { label: 'Toan mang luoi', to: '/scm/dashboard', icon: Globe },
        { label: 'Nhu cau vung', to: '/scm/regional-demand', icon: BarChart3 },
        {
          label: 'Dieu chuyen lien vung',
          to: '/scm/rebalancing',
          icon: GitMerge,
        },
        {
          label: 'Phan bo trung tam',
          to: '/scm/central-allocation',
          icon: Package,
        },
        { label: 'Mua hang', to: '/scm/procurement', icon: ShoppingCart },
      ],
    },
  ],
}

/** All available workspaces – add RM / Admin here when ready. */
export const allWorkspaces: WorkspaceConfig[] = [dealerWorkspace, scmWorkspace]

/** Resolve the active workspace from the current pathname. */
export function resolveWorkspace(pathname: string): WorkspaceConfig {
  if (pathname.startsWith('/scm')) return scmWorkspace
  return dealerWorkspace
}