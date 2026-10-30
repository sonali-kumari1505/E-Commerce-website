import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AdminProtectedRoute, ProtectedRoute } from './Protectedroutes'
import { Spinner } from '@/components/ui/spinner'

// Lazy-loaded route components for optimized bundle splitting
const Home = lazy(() => import('@/Pages/User/Home'))
const Product = lazy(() => import('@/Pages/User/Product'))
const SingleProduct = lazy(() => import('@/Pages/User/SingleProduct'))
const Login = lazy(() => import('@/Pages/Auth/Login'))
const Register = lazy(() => import('@/Pages/Auth/Register'))
const ForgotPassword = lazy(() => import('@/Pages/Auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/Pages/Auth/ResetPassword'))
const Profile = lazy(() => import('@/Pages/User/Profile'))
const CartPage = lazy(() => import('@/Pages/User/CartPage'))
const Purchase = lazy(() => import('@/Pages/User/Purchase'))
const Dashboard = lazy(() => import('@/Pages/Admin/Dashboard'))
const AnalyticDashboard = lazy(() => import('@/Pages/Admin/AnalyticDashboard'))
const ProductDashboard = lazy(() => import('@/Pages/Admin/ProductDashboard'))

const LoadingFallback = () => (
  <div className='min-h-[60vh] w-full flex items-center justify-center'>
    <Spinner />
  </div>
)

const MainRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
          {/* Public Storefront & Auth Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/product' element={<Product />} />
          <Route path='/product/:id' element={<SingleProduct />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />
          <Route path='/purchase' element={<Purchase />} />

          {/* Authenticated Customer Routes */}
          <Route path='/profile' element={
              <ProtectedRoute>
                  <Profile />
              </ProtectedRoute>
          } />
          <Route path='/cart' element={
              <ProtectedRoute>
                  <CartPage />
              </ProtectedRoute>
          } />

          {/* Admin Only Routes */}
          <Route path='/dashboard' element={
              <AdminProtectedRoute>
                  <Dashboard />
              </AdminProtectedRoute>
          }>
              <Route index element={<AnalyticDashboard />} />
              <Route path='product' element={<ProductDashboard />} />
          </Route>
      </Routes>
    </Suspense>
  )
}

export default MainRoutes
