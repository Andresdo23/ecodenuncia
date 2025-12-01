import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CadastroGestor from './pages/CadastroGestor';

// Componentes de Layout
import Header from './components/Header';
import Footer from './components/Footer';

// Configuração de Rotas Privadas
function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <div>A carregar...</div>;

  return token ? children : <Navigate to="/login" />;
}

// Definição das Rotas
function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
      <Route path="/cadastro-gestor" element={token ? <Navigate to="/" /> : <CadastroGestor />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Layout Principal
function MainLayout() {
  const { token } = useAuth();

  return (
    <>
      {token && <Header />}
      
      <main className="main-content">
        <AppRoutes />
      </main>

      {token && <Footer />}
    </>
  );
}

// App Root
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-wrapper">
          <MainLayout />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;