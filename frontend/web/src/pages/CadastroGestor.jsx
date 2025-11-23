import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://ecodenuncia.onrender.com/api';

function CadastroGestor() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [chaveSecreta, setChaveSecreta] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Um único estado controla ambos os campos
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nome || !email || !senha || !confirmarSenha || !chaveSecreta) {
        setError('Todos os campos são obrigatórios.');
        return;
    }
    if (senha !== confirmarSenha) {
        setError('As senhas não coincidem.');
        return;
    }
    if (senha.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    setLoading(true);

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
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Novo Gestor</h2>
        
        <div className="form-group">
          <label htmlFor="nome">Nome Completo:</label>
          <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Seu nome" />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ex: gestor@prefeitura.gov.br" />
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <div className="password-container">
            <input
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
            />
            {/* Botão ÚNICO que controla tudo */}
            <button 
              type="button" 
              className="btn-toggle-password"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmarSenha">Confirmar Senha:</label>
          <div className="password-container">
            <input
              // Usa o MESMO estado para mostrar/ocultar
              type={mostrarSenha ? "text" : "password"}
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              placeholder="Repita a senha"
            />
            {/* SEM BOTÃO AQUI (O de cima já controla este) */}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="chave">Chave Secreta:</label>
          <input type="password" id="chave" value={chaveSecreta} onChange={(e) => setChaveSecreta(e.target.value)} required placeholder="Chave de administrador" />
        </div>
        
        {error && <p className="form-error">{error}</p>}

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