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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('/auth/login', {
        email: email,
        senha: senha
      });
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
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        
        {error && (
          <p className="form-error">{error}</p>
        )}

        <button typeS="submit" className="btn-submit">
          Entrar
        </button>
        
        <Link to="/cadastro-gestor" className="form-link">
          Criar conta de Gestor (requer chave)
        </Link>
      </form>
    </div>
  );
}

export default Login;