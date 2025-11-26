import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data.data;
      if (usuario.tipo_usuario !== 'gestor') {
        setError('Acesso negado. Este painel é exclusivo para gestores.');
        return;
      }
      login(token, usuario);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao conectar ao servidor. Tente novamente.');
      }
    }
  };

  // --- ESTILOS EM LINHA (Garantia de funcionamento) ---
  const styles = {
    passwordWrapper: {
      position: 'relative', // Essencial
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      paddingRight: '70px', // Espaço para o botão
      fontSize: '1rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxSizing: 'border-box' // Garante que o padding não estoure
    },
    toggleBtn: {
      position: 'absolute', // Flutua sobre o input
      right: '10px', // Encostado à direita
      top: '50%',
      transform: 'translateY(-50%)', // Centraliza verticalmente
      background: 'none',
      border: 'none',
      color: '#005A9C',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      cursor: 'pointer',
      zIndex: 10,
      padding: '5px'
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>EcoDenúncia - Gestão</h2>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ex: gestor@ecodenuncia.com"
            // Aplicamos o estilo base aqui também para consistência, 
            // mas sem o paddingRight extra
            style={{...styles.input, paddingRight: '0.75rem'}} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          
          {/* Container com estilo relativo forçado */}
          <div style={styles.passwordWrapper}>
            <input
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Digite sua senha"
              style={styles.input} // Estilo do input
            />
            <button 
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={styles.toggleBtn} // Estilo do botão absoluto
            >
              {mostrarSenha ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>
        
        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-submit">Entrar</button>
        
        <Link to="/cadastro-gestor" className="form-link">
          Criar conta de Gestor (requer chave)
        </Link>
      </form>
    </div>
  );
}

export default Login;