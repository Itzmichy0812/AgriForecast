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
  label: 'Đại lý',
  displayName: 'Đại lý / Đơn vị',
  homePath: '/dealer/dashboard',
  sections: [
    {
      items: [
        { label: 'Tổng quan', to: '/dealer/dashboard', icon: LayoutDashboard },
        { label: 'Dự báo nhu cầu', to: '/dealer/forecast', icon: TrendingUp },
        { label: 'Tồn kho', to: '/dealer/inventory', icon: Warehouse },
        { label: 'Yêu cầu bổ sung', to: '/dealer/requests', icon: Bell },
      ],
    },
  ],
}

export const scmWorkspace: WorkspaceConfig = {
  role: 'scm',
  label: 'SCM',
  displayName: 'Quản lý Chuỗi cung ứng',
  homePath: '/scm/dashboard',
  sections: [
    {
      items: [
        { label: 'Toàn mạng lưới', to: '/scm/dashboard', icon: Globe },
        { label: 'Nhu cầu vùng', to: '/scm/regional-demand', icon: BarChart3 },
        {
          label: 'Điều chuyển liên vùng',
          to: '/scm/rebalancing',
          icon: GitMerge,
        },
        {
          label: 'Phân bổ trung tâm',
          to: '/scm/central-allocation',
          icon: Package,
        },
        { label: 'Mua hàng', to: '/scm/procurement', icon: ShoppingCart },
      ],
    },
  ],
}

/** All available workspaces - add RM / Admin here when ready. */
export const allWorkspaces: WorkspaceConfig[] = [dealerWorkspace, scmWorkspace]

/** Resolve the active workspace from the current pathname. */
export function resolveWorkspace(pathname: string): WorkspaceConfig {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (firstSegment === 'scm') return scmWorkspace
  return dealerWorkspace
}