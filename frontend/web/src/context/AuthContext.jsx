import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Para verificar o localStorage

  useEffect(() => {
    // Tentar carregar o token e o usuário do localStorage ao iniciar
    const storedToken = localStorage.getItem('token');
    const storedUsuario = localStorage.getItem('usuario');

    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
    setLoading(false);
  }, []);

  // --- MELHORIA: Funções para gerenciar o estado ---
  
  const login = (novoToken, novoUsuario) => {
    // 1. Atualiza o estado do React
    setToken(novoToken);
    setUsuario(novoUsuario);
    // 2. Atualiza o localStorage
    localStorage.setItem('token', novoToken);
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
  };

  const logout = () => {
    // 1. Limpa o estado do React
    setToken(null);
    setUsuario(null);
    // 2. Limpa o localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };
  // --- Fim da Melhoria ---

  const value = {
    usuario,
    token,
    loading,
    login,  // Expor a função
    logout  // Expor a função
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  return useContext(AuthContext);
}