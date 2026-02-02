import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from '../auth/Login'
import RequireAuth from '../auth/RequireAuth'
import DashboardLayout from '../layouts/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import NotFound from '../pages/NotFound'
import ProductosList from '../modules/productos/ProductosList'
import PedidosList from '../modules/pedidos/PedidosList'
import VentasList from '../modules/ventas/VentasList'
import Cajas from '../modules/cajas/Cajas'
import KitchenBoard from '../modules/pedidos/KitchenBoard'
import Inventario from '../modules/inventario/Inventario'
import BI from '../modules/bi/BI'
import Usuarios from '../modules/usuarios/Usuarios'
import Restaurantes from '../modules/restaurantes/Restaurantes'

const router = createBrowserRouter(
  [
    { path: '/', element: <Login /> },
    {
      path: '/dashboard',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    {
      path: '/productos',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <ProductosList />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    {
      path: '/pedidos',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <PedidosList />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    {
      path: '/ventas',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <VentasList />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    {
      path: '/inventario',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <Inventario />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    {
      path: '/cajas',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <Cajas />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    {
      path: '/restaurantes',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <Restaurantes />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    {
      path: '/usuarios',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <Usuarios />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    {
      path: '/reportes',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <BI />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    {
      path: '/cocina',
      element: (
        <RequireAuth>
          <DashboardLayout>
            <KitchenBoard />
          </DashboardLayout>
        </RequireAuth>
      ),
    },
    { path: '*', element: <NotFound /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
)

export default function Router() {
  return <RouterProvider router={router} />
}
