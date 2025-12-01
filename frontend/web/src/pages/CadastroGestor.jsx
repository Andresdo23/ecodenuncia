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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nome || !email || !senha || !confirmarSenha || !chaveSecreta) {
        return setError('Todos os campos são obrigatórios.');
    }
    if (senha !== confirmarSenha) {
        return setError('As senhas não coincidem.');
    }
    if (senha.length < 6) {
        return setError('A senha deve ter pelo menos 6 caracteres.');
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
      const msg = err.response?.data?.error || 'Erro ao conectar ao servidor. Tente novamente.';
      setError(msg);
    } finally {
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
          <div style={styles.passwordWrapper}>
            <input
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              style={styles.input}
            />
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
          <div style={styles.passwordWrapper}>
            <input
              type={mostrarSenha ? "text" : "password"}
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              placeholder="Repita a senha"
              style={styles.input}
            />
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