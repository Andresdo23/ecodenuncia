import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data.data;

      if (usuario.tipo_usuario !== 'gestor') {
        setError('Acesso negado. Este painel é exclusivo para gestores.');
        setLoading(false);
        return;
      }

      login(token, usuario);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao conectar ao servidor. Tente novamente.';
      setError(msg);
      setLoading(false);
    }
  };

  const styles = {
    passwordWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      paddingRight: '70px',
      fontSize: '1rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxSizing: 'border-box'
    },
    toggleBtn: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
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
            style={{...styles.input, paddingRight: '0.75rem'}} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <div style={styles.passwordWrapper}>
            <input
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Digite sua senha"
              style={styles.input}
            />
            <button 
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={styles.toggleBtn}
            >
              {mostrarSenha ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>
        
        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        
        <Link to="/cadastro-gestor" className="form-link">
          Criar conta de Gestor (requer chave)
        </Link>
      </form>
    </div>
  );
}

export default Login;