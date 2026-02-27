import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import ScrollToTop from './components/ScrollToTop';

// Lazy loaded Pages
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Documents = lazy(() => import('./pages/Documents'));
const Property = lazy(() => import('./pages/Property'));
const Insurance = lazy(() => import('./pages/Insurance'));
const Weather = lazy(() => import('./pages/Weather'));
const Profile = lazy(() => import('./pages/Profile'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const FieldAdvisor = lazy(() => import('./pages/FieldAdvisor'));
const ClaimsDashboard = lazy(() => import('./pages/ClaimsDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CropIntelligence = lazy(() => import('./pages/CropIntelligence'));
const About = lazy(() => import('./pages/About'));
const Team = lazy(() => import('./pages/Team'));
const CropCalculator = lazy(() => import('./pages/CropCalculator'));
const Tasks = lazy(() => import('./pages/Tasks'));
const AIChat = lazy(() => import('./pages/AIChat'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const token = localStorage.getItem('token');

  // Only log once per render
  const shouldAllowAccess = token || isAuthenticated;

  if (!shouldAllowAccess) {
    console.log('No authentication, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent flex items-center justify-center rounded-full animate-spin"></div></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/property"
            element={
              <ProtectedRoute>
                <Property />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurance"
            element={
              <ProtectedRoute>
                <Insurance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/field-advisor"
            element={
              <ProtectedRoute>
                <FieldAdvisor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims"
            element={
              <ProtectedRoute>
                <ClaimsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crop-intelligence"
            element={
              <ProtectedRoute>
                <CropIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crop-calculator"
            element={
              <ProtectedRoute>
                <CropCalculator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-chat"
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
