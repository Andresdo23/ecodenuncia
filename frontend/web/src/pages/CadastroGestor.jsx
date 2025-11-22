import React, { useState } from 'react';
import { Link, useNavigate }
 from 'react-router-dom';
import axios from 'axios'; // Usamos axios direto, não a 'api' global

// O 'api.js' não funciona aqui porque precisamos de enviar
// uma requisição ANTES de termos um token.
const API_URL = 'http://localhost:3001/api';

function CadastroGestor() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [chaveSecreta, setChaveSecreta] = useState(''); // Chave para criar gestor
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
      // Fazemos a chamada de registo com a chave secreta no header
      await axios.post(
        `${API_URL}/auth/register`, 
        {
          nome,
          email,
          senha,
          tipo_usuario: 'gestor'
        }, 
        {
          headers: {
            'x-admin-secret': chaveSecreta // Envia a chave
          }
        }
      );
      
      // Sucesso!
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
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h2>Painel de Gestão - Criar Conta Gestor</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="nome">Nome Completo:</label><br />
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">Email:</label><br />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="senha">Senha:</label><br />
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="chave">Chave Secreta de Admin:</label><br />
          <input
            type="password"
            id="chave"
            value={chaveSecreta}
            onChange={(e) => setChaveSecreta(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}

        <button type="submit" style={{ padding: '10px 15px' }} disabled={loading}>
          {loading ? 'A criar...' : 'Criar Conta'}
        </button>
      </form>
      <Link to="/login" style={{ display: 'block', marginTop: '15px' }}>
        Já tem conta? Faça login
      </Link>
    </div>
  );
}

export default CadastroGestor;