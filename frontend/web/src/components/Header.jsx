import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-logo">
        EcoDenúncia
      </div>
      <nav className="header-nav">
        {/* Links para páginas no futuro */}
        <Link to="/">Sobre</Link>
        <Link to="/">Contato</Link>
        
        {usuario && (
          <>
            <Link to="/">Perfil</Link> 
            <button onClick={logout}>Sair</button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;