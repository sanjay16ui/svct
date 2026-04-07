import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppNavbar from './components/AppNavbar'
import PageTransition from './components/PageTransition'
import ToastHost from './components/ToastHost'
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute'
import AdminPage from './pages/AdminPage'
import DemoPage from './pages/DemoPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ShopPage from './pages/ShopPage'
import SignupPage from './pages/SignupPage'
import NotFoundPage from './pages/NotFoundPage'
import TrackOrderPage from './pages/TrackOrderPage'
import WishlistPage from './pages/WishlistPage'

function App() {
  const location = useLocation()

  return (
    <>
      <ToastHost />
      <AppNavbar />
      <div className="pt-28">
        <PageTransition>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <ShopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/track/:orderId" element={<TrackOrderPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </PageTransition>
      </div>
    </>
  )
}

export default App
