import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import SiteLayout from '@/components/SiteLayout';
// Add page imports here
import Home from '@/pages/Home';
import Browse from '@/pages/Browse';
import FullList from '@/pages/FullList';
import SharpenerDetail from '@/pages/SharpenerDetail';
import Book from '@/pages/Book';
import Collectors from '@/pages/Collectors';
import CollectorDetail from '@/pages/CollectorDetail';
import SwapList from '@/pages/SwapList';
import About from '@/pages/About';
import ClassicStropper from '@/pages/ClassicStropper';
import Advertising from '@/pages/Advertising';
import Admin from '@/pages/Admin';
import History from '@/pages/History';
import ArticleDetail from '@/pages/ArticleDetail';
import MakerDetail from '@/pages/MakerDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Mfa from '@/pages/Mfa';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/list" element={<FullList />} />
        <Route path="/sharpener/:id" element={<SharpenerDetail />} />
        <Route path="/book" element={<Book />} />
        <Route path="/collectors" element={<Collectors />} />
        <Route path="/collectors/:id" element={<CollectorDetail />} />
        <Route path="/swap-list" element={<SwapList />} />
        <Route path="/about" element={<About />} />
        <Route path="/classic" element={<ClassicStropper />} />
        <Route path="/advertising" element={<Advertising />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:slug" element={<ArticleDetail />} />
        <Route path="/makers/:id" element={<MakerDetail />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mfa" element={<Mfa />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App