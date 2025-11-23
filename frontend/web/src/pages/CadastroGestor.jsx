import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// URL Fixa do Render (Produção)
const API_URL = 'https://ecodenuncia.onrender.com/api';

function CadastroGestor() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [chaveSecreta, setChaveSecreta] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!nome || !email || !senha || !chaveSecreta) {
        setError('Todos os campos são obrigatórios.');
        setLoading(false);
        return;
    }

    try {
      await axios.post(
        `${API_URL}/auth/register`, 
        { nome, email, senha, tipo_usuario: 'gestor' }, 
        { headers: { 'x-admin-secret': chaveSecreta } }
      );
      
      alert('Conta de Gestor criada! Por favor, faça login.');
      navigate('/login');

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao conectar ao servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // USANDO AS CLASSES CSS RESPONSIVAS
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Novo Gestor</h2>
        
        <div className="form-group">
          <label htmlFor="nome">Nome Completo:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Seu nome"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@exemplo.com"
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
            placeholder="Sua senha"
          />
        </div>

        <div className="form-group">
          <label htmlFor="chave">Chave Secreta:</label>
          <input
            type="password"
            id="chave"
            value={chaveSecreta}
            onChange={(e) => setChaveSecreta(e.target.value)}
            required
            placeholder="Chave de admin"
          />
        </div>
        
        {error && (
          <p className="form-error">{error}</p>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'A criar...' : 'Criar Conta'}
        </button>
        
        <Link to="/login" className="form-link">
          Já tem conta? Faça login
        </Link>
      </form>
    </div>
  );
}

export default CadastroGestor;