// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/Transactions';
import CategoryPage from './pages/CategoryPage';
import BudgetPage from './pages/BudgetPage';

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/categories" element={<CategoryPage />} />
          </Route>
          
          {/* Redirect to dashboard if authenticated, otherwise to login */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;