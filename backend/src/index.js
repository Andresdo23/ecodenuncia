require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Serviços e Middleware
const supabase = require('./supabaseClient');
const auth = require('./middleware/auth');
const checkGestor = require('./middleware/checkGestor');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configurações Iniciais ---

// Configuração do Multer (Armazenamento em memória)
const upload = multer({ storage: multer.memoryStorage() });

// Configuração de CORS
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
}));

app.use(express.json());

// Configuração do Banco de Dados (PostgreSQL)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }
});

// --- Health Check ---

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API está funcional!' });
});

// ==============================================================================
// MÓDULO DE AUTENTICAÇÃO (AUTH)
// ==============================================================================

// Registrar novo usuário
app.post('/api/auth/register', async (req, res) => {
  const { nome, email, senha, tipo_usuario, data_nascimento, telefone, cpf } = req.body;

  if (!nome || !email || !senha || !tipo_usuario) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios: nome, email, senha, tipo_usuario.' });
  }

  // Validação de segurança para criação de gestores
  if (tipo_usuario === 'gestor' && req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET_KEY) {
     return res.status(403).json({ success: false, error: 'Não autorizado a criar gestor.'});
  }

  // Formatação da data de nascimento
  let dataNascimentoSQL = null;
  if (data_nascimento) {
    const partes = data_nascimento.split('/');
    if (partes.length === 3 && partes[2].length === 4) {
      dataNascimentoSQL = `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    const query = `
      INSERT INTO USUARIO (nome, email, senha_hash, tipo_usuario, data_nascimento, telefone, cpf)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, nome, tipo_usuario
    `;
    
    const values = [nome, email, senha_hash, tipo_usuario, dataNascimentoSQL, telefone || null, cpf || null];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      data: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') { 
      const msg = error.constraint === 'usuario_cpf_key' ? 'CPF já está em uso.' : 'E-mail já está em uso.';
      return res.status(409).json({ success: false, error: msg });
    }
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ success: false, error: 'Erro interno ao registrar.' });
  }
});

// Login de usuário
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const result = await pool.query('SELECT * FROM USUARIO WHERE email = $1 AND is_ativo = true', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    }

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    }

    const payload = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo_usuario: usuario.tipo_usuario
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: { token, usuario: payload }
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

// ==============================================================================
// MÓDULO DE USUÁRIOS (USER)
// ==============================================================================

// Atualizar perfil (Email/Telefone)
app.put('/api/users/me', auth, async (req, res) => {
  const { id } = req.usuario;
  const { email, telefone } = req.body;

  if (!email && !telefone) {
    return res.status(400).json({ success: false, error: 'Nenhum dado para atualizar.' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM USUARIO WHERE id = $1', [id]);
    const currentUser = rows[0];

    const newEmail = email || currentUser.email;
    const newTelefone = telefone || currentUser.telefone;

    const queryUpdate = `
      UPDATE USUARIO
      SET email = $1, telefone = $2
      WHERE id = $3
      RETURNING id, email, nome, tipo_usuario;
    `;
    
    const result = await pool.query(queryUpdate, [newEmail, newTelefone, id]);

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      data: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505' && error.constraint === 'usuario_email_key') {
      return res.status(409).json({ success: false, error: 'E-mail já está em uso.' });
    }
    console.error('Erro ao editar perfil:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

// Alterar Senha
app.put('/api/users/me/password', auth, async (req, res) => {
  const { id } = req.usuario;
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) return res.status(400).json({ success: false, error: 'Dados incompletos.' });
  if (novaSenha.length < 6) return res.status(400).json({ success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' });

  try {
    const { rows } = await pool.query('SELECT senha_hash FROM USUARIO WHERE id = $1 AND is_ativo = true', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });

    const senhaCorreta = await bcrypt.compare(senhaAtual, rows[0].senha_hash);
    if (!senhaCorreta) return res.status(401).json({ success: false, error: 'Senha atual incorreta.' });

    const salt = await bcrypt.genSalt(10);
    const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

    await pool.query('UPDATE USUARIO SET senha_hash = $1 WHERE id = $2', [novaSenhaHash, id]);

    res.status(200).json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro ao mudar senha:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

// Excluir Conta (Soft Delete)
app.delete('/api/users/me', auth, async (req, res) => {
  const { id } = req.usuario;
  const { senha } = req.body;

  if (!senha) return res.status(400).json({ success: false, error: 'Senha obrigatória para exclusão.' });

  try {
    const { rows } = await pool.query('SELECT senha_hash FROM USUARIO WHERE id = $1 AND is_ativo = true', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });

    const senhaCorreta = await bcrypt.compare(senha, rows[0].senha_hash);
    if (!senhaCorreta) return res.status(401).json({ success: false, error: 'Senha incorreta.' });

    await pool.query('UPDATE USUARIO SET is_ativo = false WHERE id = $1', [id]);

    res.status(200).json({ success: true, message: 'Conta excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

// ==============================================================================
// MÓDULO DE UPLOAD
// ==============================================================================

app.post('/api/upload/image', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });

  const id_usuario = req.usuario.id;
  const nomeArquivo = `${id_usuario}/${Date.now()}-${req.file.originalname}`;

  try {
    const { error } = await supabase.storage
      .from('denuncias')
      .upload(nomeArquivo, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    
    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from('denuncias').getPublicUrl(nomeArquivo);
    if (!publicUrlData) throw new Error('Falha ao obter URL pública.');

    res.status(200).json({ success: true, message: 'Upload realizado!', data: { url: publicUrlData.publicUrl } });

  } catch (error) {
    console.error('Erro no upload Supabase:', error);
    res.status(500).json({ success: false, error: 'Erro interno no upload.' });
  }
});

// ==============================================================================
// MÓDULO DE DENÚNCIAS
// ==============================================================================

// Criar Denúncia
app.post('/api/denuncias', auth, async (req, res) => {
  const { descricao, url_foto, latitude, longitude, data_ocorrencia, endereco_completo, ponto_referencia } = req.body;
  const id_usuario = req.usuario.id;

  if (!url_foto || !latitude || !longitude) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios: foto, latitude e longitude.' });
  }

  const dataOcorrenciaFinal = data_ocorrencia ? new Date(data_ocorrencia) : new Date();

  try {
    const query = `
      INSERT INTO DENUNCIA (id_usuario, descricao, url_foto, latitude, longitude, data_ocorrencia, endereco_completo, ponto_referencia)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *;
    `;
    const values = [id_usuario, descricao, url_foto, latitude, longitude, dataOcorrenciaFinal, endereco_completo, ponto_referencia];
    
    const result = await pool.query(query, values);
    res.status(201).json({ success: true, message: 'Denúncia criada!', data: result.rows[0] });

  } catch (error) {
    console.error('Erro ao criar denúncia:', error);
    res.status(500).json({ success: false, error: 'Erro interno ao criar denúncia.' });
  }
});

// Listar Denúncias
app.get('/api/denuncias', auth, async (req, res) => {
  const { id: id_usuario, tipo_usuario } = req.usuario;
  
  let query = `
    SELECT d.id, d.descricao, d.url_foto, d.latitude, d.longitude, 
           d.data_ocorrencia, d.data_criacao, s.nome_status, d.endereco_completo,
           d.ponto_referencia, d.id_usuario
    FROM DENUNCIA d
    JOIN STATUS_DENUNCIA s ON d.id_status = s.id
    WHERE d.is_excluida = false
  `;
  
  const values = [];

  try {
    if (tipo_usuario === 'cidadao') {
      query += ' AND d.id_usuario = $1 ORDER BY d.data_criacao DESC';
      values.push(id_usuario);
    } else if (tipo_usuario === 'gestor') {
      query += ' ORDER BY d.data_criacao DESC';
    } else {
      return res.status(403).json({ success: false, error: 'Tipo de usuário inválido.' });
    }

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, data: result.rows });

  } catch (error) {
    console.error('Erro ao buscar denúncias:', error);
    res.status(500).json({ success: false, error: 'Erro interno ao buscar denúncias.' });
  }
});

// Atualizar Status (Gestor)
app.put('/api/denuncias/:id/status', auth, checkGestor, async (req, res) => {
  const { id: id_denuncia } = req.params;
  const { id_status } = req.body;

  if (!id_status) return res.status(400).json({ success: false, error: 'ID do status é obrigatório.' });

  try {
    const resDenunciaAtual = await pool.query('SELECT id_status FROM DENUNCIA WHERE id = $1', [id_denuncia]);
    
    if (resDenunciaAtual.rows.length === 0) return res.status(404).json({ success: false, error: 'Denúncia não encontrada.' });
    
    if (resDenunciaAtual.rows[0].id_status === 3) {
      return res.status(409).json({ success: false, error: 'Denúncia já resolvida não pode ser alterada.' });
    }

    const result = await pool.query('UPDATE DENUNCIA SET id_status = $1 WHERE id = $2 RETURNING *', [id_status, id_denuncia]);
    res.status(200).json({ success: true, message: 'Status atualizado!', data: result.rows[0] });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ success: false, error: 'Erro interno ao atualizar status.' });
  }
});

// Editar Denúncia
app.put('/api/denuncias/:id', auth, async (req, res) => {
  const { id: id_denuncia } = req.params;
  const { id: id_usuario } = req.usuario;
  const { descricao, endereco_completo, ponto_referencia } = req.body;

  try {
    const resDenuncia = await pool.query('SELECT id_usuario FROM DENUNCIA WHERE id = $1 AND is_excluida = false', [id_denuncia]);
    
    if (resDenuncia.rows.length === 0) return res.status(404).json({ success: false, error: 'Denúncia não encontrada.' });
    if (resDenuncia.rows[0].id_usuario !== id_usuario) return res.status(403).json({ success: false, error: 'Acesso negado.' });

    const queryUpdate = `UPDATE DENUNCIA SET descricao = $1, endereco_completo = $2, ponto_referencia = $3 WHERE id = $4 RETURNING *`;
    const values = [descricao || null, endereco_completo || null, ponto_referencia || null, id_denuncia];
    
    const result = await pool.query(queryUpdate, values);
    res.status(200).json({ success: true, message: 'Denúncia atualizada!', data: result.rows[0] });

  } catch (error) {
    console.error('Erro ao editar denúncia:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

// Excluir Denúncia (Soft Delete)
app.put('/api/denuncias/:id/excluir', auth, async (req, res) => {
  const { id: id_denuncia } = req.params;
  const { id: id_usuario } = req.usuario;
  const { motivo } = req.body;

  if (!motivo) return res.status(400).json({ success: false, error: 'Motivo é obrigatório.' });

  try {
    const resDenuncia = await pool.query('SELECT id_usuario FROM DENUNCIA WHERE id = $1 AND is_excluida = false', [id_denuncia]);
    
    if (resDenuncia.rows.length === 0) return res.status(404).json({ success: false, error: 'Denúncia não encontrada.' });
    if (resDenuncia.rows[0].id_usuario !== id_usuario) return res.status(403).json({ success: false, error: 'Acesso negado.' });

    await pool.query('UPDATE DENUNCIA SET is_excluida = true, motivo_exclusao = $1 WHERE id = $2', [motivo, id_denuncia]);
    res.status(200).json({ success: true, message: 'Denúncia excluída com sucesso!' });

  } catch (error) {
    console.error('Erro ao excluir denúncia:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

// --- Inicialização ---

app.listen(PORT, () => {
  console.log(`Servidor EcoDenúncia rodando na porta ${PORT}`);
});