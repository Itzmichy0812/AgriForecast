import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RouteErrorPage } from '@/components/shared/RouteErrorPage'
import { NotFoundPage } from '@/components/shared/NotFoundPage'
import { PlaceholderPage } from '@/components/shared/PlaceholderPage'
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
          // Dealer catch-all: recover to dealer dashboard
          {
            path: '*',
            element: <Navigate to="/dealer/dashboard" replace />,
          },
        ],
      },

      // SCM Workspace (Phase 3+)
      {
        path: '/scm',
        children: [
          {
            path: 'dashboard',
            element: (
              <PlaceholderPage
                title="Toàn mạng lưới"
                description="Tổng quan toàn mạng lưới phân phối sẽ được xây dựng ở đây."
              />
            ),
          },
          {
            path: 'regional-demand',
            element: (
              <PlaceholderPage
                title="Nhu cầu vùng"
                description="Phân tích và tổng hợp nhu cầu theo vùng địa lý sẽ được xây dựng ở đây."
              />
            ),
          },
          {
            path: 'rebalancing',
            element: (
              <PlaceholderPage
                title="Điều chuyển liên vùng"
                description="Công cụ lập kế hoạch và phê duyệt điều chuyển hàng hóa sẽ được xây dựng ở đây."
              />
            ),
          },
          {
            path: 'central-allocation',
            element: (
              <PlaceholderPage
                title="Phân bổ trung tâm"
                description="Màn hình phân bổ từ kho trung tâm xuống các vùng sẽ được xây dựng ở đây."
              />
            ),
          },
          {
            path: 'procurement',
            element: (
              <PlaceholderPage
                title="Mua hàng"
                description="Quản lý đề xuất và phê duyệt kế hoạch mua hàng sẽ được xây dựng ở đây."
              />
            ),
          },
          // SCM catch-all: recover to SCM dashboard
          {
            path: '*',
            element: <Navigate to="/scm/dashboard" replace />,
          },
        ],
      },
    ],
  },

  // Generic 404 for completely unknown roots
  {
    path: '*',
    element: <NotFoundPage />,
  },
])