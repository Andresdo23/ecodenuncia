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
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [chaveSecreta, setChaveSecreta] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Estado único para controlar ambas as senhas
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

  // --- ESTILOS EM LINHA (Garantia de funcionamento) ---
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
      paddingRight: '70px', // Espaço para o botão
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
            // Reutilizamos o estilo do input, mas ajustamos o paddingRight 
            // pois este campo não tem botão
            style={{...styles.input, paddingRight: '0.75rem'}}
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
            placeholder="ex: gestor@prefeitura.gov.br"
            style={{...styles.input, paddingRight: '0.75rem'}}
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          
          {/* Wrapper Relativo */}
          <div style={styles.passwordWrapper}>
            <input
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              style={styles.input} // Estilo do input
            />
            {/* Botão Absoluto (Controla tudo) */}
            <button 
              type="button" 
              style={styles.toggleBtn}
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmarSenha">Confirmar Senha:</label>
          
          {/* Wrapper Relativo (mesmo sem botão, para manter o estilo do input igual) */}
          <div style={styles.passwordWrapper}>
            <input
              type={mostrarSenha ? "text" : "password"} // Controlado pelo mesmo estado
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              placeholder="Repita a senha"
              style={styles.input}
            />
            {/* Sem botão aqui, o de cima já resolve */}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="chave">Chave Secreta:</label>
          <input
            type="password"
            id="chave"
            value={chaveSecreta}
            onChange={(e) => setChaveSecreta(e.target.value)}
            required
            placeholder="Chave de administrador"
            style={{...styles.input, paddingRight: '0.75rem'}}
          />
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