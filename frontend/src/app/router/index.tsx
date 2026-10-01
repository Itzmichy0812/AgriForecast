import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RouteErrorPage } from '@/components/shared/RouteErrorPage'
import { NotFoundPage } from '@/components/shared/NotFoundPage'
import { DealerDashboardPage } from '@/features/dealer/dashboard/DealerDashboardPage'
import { ForecastWorkspacePage } from '@/features/dealer/forecast/ForecastWorkspacePage'
import { ForecastDetailPage } from '@/features/dealer/forecast/ForecastDetailPage'
import { InventoryPage } from '@/features/dealer/inventory/InventoryPage'
import { RequestsWorkspacePage } from '@/features/dealer/requests/RequestsWorkspacePage'

export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to="/dealer/dashboard" replace />,
  },

  // AppShell layout
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      // Dealer Workspace
      {
        path: '/dealer',
        children: [
          {
            path: 'dashboard',
            element: <DealerDashboardPage />,
          },
          {
            path: 'forecast',
            element: <ForecastWorkspacePage />,
          },
          {
            path: 'forecast/:forecastId',
            element: <ForecastDetailPage />,
          },
          {
            path: 'inventory',
            element: <InventoryPage />,
          },
          {
            path: 'requests',
            element: <RequestsWorkspacePage />,
          },
          {
            path: 'requests/:requestId',
            element: <RequestsWorkspacePage />,
          },
          // Dealer catch-all
          {
            path: '*',
            element: <Navigate to="/dealer/dashboard" replace />,
          },
        ],
      },

      // SCM Workspace — lazy-loaded to keep initial bundle small
      {
        path: '/scm',
        children: [
          {
            path: 'dashboard',
            lazy: async () => {
              const { ScmDashboardPage } = await import('@/features/scm/dashboard/ScmDashboardPage')
              return { Component: ScmDashboardPage }
            },
          },
          {
            path: 'regional-demand',
            lazy: async () => {
              const { RegionalDemandPage } = await import('@/features/scm/regional-demand/RegionalDemandPage')
              return { Component: RegionalDemandPage }
            },
          },
          {
            path: 'rebalancing',
            lazy: async () => {
              const { RebalancingPage } = await import('@/features/scm/rebalancing/RebalancingPage')
              return { Component: RebalancingPage }
            },
          },
          {
            path: 'central-allocation',
            lazy: async () => {
              const { CentralAllocationPage } = await import('@/features/scm/central-allocation/CentralAllocationPage')
              return { Component: CentralAllocationPage }
            },
          },
          {
            path: 'procurement',
            lazy: async () => {
              const { ProcurementPage } = await import('@/features/scm/procurement/ProcurementPage')
              return { Component: ProcurementPage }
            },
          },
          // SCM catch-all
          {
            path: '*',
            element: <Navigate to="/scm/dashboard" replace />,
          },
        ],
      },
    ],
  },

  // Generic 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
])