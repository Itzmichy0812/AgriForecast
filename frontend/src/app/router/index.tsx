import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RouteErrorPage } from '@/components/shared/RouteErrorPage'
import { NotFoundPage } from '@/components/shared/NotFoundPage'
import { PlaceholderPage } from '@/components/shared/PlaceholderPage'
import { DealerDashboardPage } from '@/features/dealer/dashboard/DealerDashboardPage'

export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to="/dealer/dashboard" replace />,
  },

  // ── AppShell layout ──────────────────────────────────────────
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      // ── Dealer ──────────────────────────────────────────────
      {
        path: '/dealer',
        children: [
          {
            path: 'dashboard',
            element: <DealerDashboardPage />,
          },
          {
            path: 'forecast',
            element: (
              <PlaceholderPage
                title="Du bao nhu cau"
                description="Man hinh du bao nhu cau theo khu vuc va san pham se duoc xay dung o day."
              />
            ),
          },
          {
            path: 'inventory',
            element: (
              <PlaceholderPage
                title="Ton kho"
                description="Bang theo doi ton kho va canh bao muc nguong se duoc xay dung o day."
              />
            ),
          },
          {
            path: 'requests',
            element: (
              <PlaceholderPage
                title="Yeu cau bo sung"
                description="Danh sach va quan ly yeu cau bo sung hang hoa se duoc xay dung o day."
              />
            ),
          },
          // Dealer catch-all: recover to dealer dashboard
          {
            path: '*',
            element: <Navigate to="/dealer/dashboard" replace />,
          },
        ],
      },

      // ── SCM ─────────────────────────────────────────────────
      {
        path: '/scm',
        children: [
          {
            path: 'dashboard',
            element: (
              <PlaceholderPage
                title="Toan mang luoi"
                description="Tong quan toan mang luoi phan phoi se duoc xay dung o day."
              />
            ),
          },
          {
            path: 'regional-demand',
            element: (
              <PlaceholderPage
                title="Nhu cau vung"
                description="Phan tich va tong hop nhu cau theo vung dia ly se duoc xay dung o day."
              />
            ),
          },
          {
            path: 'rebalancing',
            element: (
              <PlaceholderPage
                title="Dieu chuyen lien vung"
                description="Cong cu lap ke hoach va phe duyet dieu chuyen hang hoa se duoc xay dung o day."
              />
            ),
          },
          {
            path: 'central-allocation',
            element: (
              <PlaceholderPage
                title="Phan bo trung tam"
                description="Man hinh phan bo tu kho trung tam xuong cac vung se duoc xay dung o day."
              />
            ),
          },
          {
            path: 'procurement',
            element: (
              <PlaceholderPage
                title="Mua hang"
                description="Quan ly de xuat va phe duyet ke hoach mua hang se duoc xay dung o day."
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