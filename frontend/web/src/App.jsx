import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CadastroGestor from './pages/CadastroGestor';

// Nossos novos componentes de layout
import Header from './components/Header';
import Footer from './components/Footer';

// Rota Privada (sem alterações)
function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) { return <div>A carregar...</div>; }
  return token ? children : <Navigate to="/login" />;
}

// Roteador de Páginas (sem alterações)
function AppRoutes() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
      <Route path="/cadastro-gestor" element={token ? <Navigate to="/" /> : <CadastroGestor />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Componente App Principal (Atualizado com o novo layout)
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* O novo wrapper de layout */}
        <div className="app-wrapper">
          {/* O Header e Footer agora estão fora das Rotas,
              mas o Login/Cadastro não deve tê-los.
              Vamos mover isto para dentro. */}
          
          {/* Correção: O AuthProvider precisa de estar no topo.
              Vamos usar um componente de Layout para decidir. */}
          <MainLayout />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// NOVO: Componente de Layout
// Decide se mostra o Header/Footer (para o Dashboard)
// ou não (para o Login)
function MainLayout() {
  const { token } = useAuth();

  return (
    <>
      {/* Só mostra o Header se estiver logado */}
      {token && <Header />}

      <main className="main-content">
        <AppRoutes />
      </main>

      {/* Só mostra o Footer se estiver logado */}
      {token && <Footer />}
    </>
  );
}

export default App;