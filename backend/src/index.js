// ---
// MELHORIA: Carregar variáveis de ambiente (do .env) PRIMEIRO
// ---
require('dotenv').config();

// ---
// Importação dos pacotes
// ---
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const checkGestor = require('./middleware/checkGestor');
const supabase = require('./supabaseClient');
const multer = require('multer');

// Configuração do Multer
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// --- CORREÇÃO DE CORS ---
// Permite explicitamente o nosso cabeçalho personalizado 'x-admin-secret'
app.use(cors({
  origin: '*', // Permite acesso de qualquer lugar (Vercel, Mobile, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
}));
// -----------------------

app.use(express.json());

// ---
// Configuração do Banco de Dados
// ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint "Health Check"
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API está funcional!' });
});

// ---
// Endpoint: RF001 - Registrar novo usuário
// Rota: POST /api/auth/register
// ---
app.post('/api/auth/register', async (req, res) => {
  const { 
    nome, 
    email, 
    senha, 
    tipo_usuario, 
    data_nascimento,
    telefone,
    cpf
  } = req.body;

  if (!nome || !email || !senha || !tipo_usuario) {
    return res.status(400).json({ 
      success: false, 
      error: 'Campos principais são obrigatórios: nome, email, senha, tipo_usuario.' 
    });
  }

  if (tipo_usuario === 'gestor' && req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET_KEY) {
     return res.status(403).json({ success: false, error: 'Não autorizado a criar gestor.'});
  }

  let dataNascimentoSQL = null;
  if (data_nascimento) {
    const partes = data_nascimento.split('/');
    if (partes.length === 3 && partes[2].length === 4) {
      dataNascimentoSQL = `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
  }

  const salt = await bcrypt.genSalt(10);
  const senha_hash = await bcrypt.hash(senha, salt);

  try {
    const query = `
      INSERT INTO USUARIO (nome, email, senha_hash, tipo_usuario, data_nascimento, telefone, cpf)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, nome, tipo_usuario
    `;
    const values = [
      nome, 
      email, 
      senha_hash, 
      tipo_usuario, 
      dataNascimentoSQL, 
      telefone || null,
      cpf || null
    ];

    const result = await pool.query(query, values);
    const novoUsuario = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      data: novoUsuario
    });

  } catch (error) {
    if (error.code === '23505') { 
      if (error.constraint === 'usuario_email_key') {
        return res.status(409).json({ success: false, error: 'O e-mail fornecido já está em uso.' });
      }
      if (error.constraint === 'usuario_cpf_key') {
        return res.status(409).json({ success: false, error: 'O CPF fornecido já está em uso.' });
      }
      return res.status(409).json({ success: false, error: 'Ocorreu um conflito. O e-mail ou CPF já pode estar em uso.' });
    }
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor ao tentar registrar.' 
    });
  }
});

// ---
// Endpoint: POST /api/auth/login
// ---
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ 
      success: false, 
      error: 'E-mail e senha são obrigatórios.' 
    });
  }

  try {
    const query = 'SELECT * FROM USUARIO WHERE email = $1 AND is_ativo = true';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas.'
      });
    }

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas.'
      });
    }

    const payload = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo_usuario: usuario.tipo_usuario
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' } 
    );

    res.status(200).json({
      success: true,
      message: 'Login bem-sucedido!',
      data: {
        token: token,
        usuario: payload
      }
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor.' 
    });
  }
});

// ---
// Endpoint: PUT /api/users/me (Editar Perfil)
// ---
app.put('/api/users/me', auth, async (req, res) => {
  const { id } = req.usuario;
  const { email, telefone } = req.body;

  if (!email && !telefone) {
    return res.status(400).json({ success: false, error: 'Nenhum campo para atualizar.' });
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
      return res.status(409).json({ success: false, error: 'O e-mail fornecido já está em uso por outra conta.' });
    }
    console.error('Erro ao editar perfil:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});


// ---
// Endpoint: POST /api/denuncias
// ---
app.post('/api/denuncias', auth, async (req, res) => {
  const { 
    descricao, url_foto, latitude, longitude, data_ocorrencia, // 'titulo' removido
    endereco_completo, ponto_referencia
  } = req.body;
  const id_usuario = req.usuario.id;

  if (!url_foto || !latitude || !longitude) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios ausentes: url_foto, latitude e longitude.' });
  }
  const dataOcorrenciaFinal = data_ocorrencia ? new Date(data_ocorrencia) : new Date();
  
  try {
    // CORREÇÃO: 'titulo' removido da query e dos values
    const query = `
      INSERT INTO DENUNCIA 
        (id_usuario, descricao, url_foto, latitude, longitude, data_ocorrencia, endereco_completo, ponto_referencia)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *; 
    `;
    const values = [
      id_usuario, descricao, url_foto, latitude, longitude, 
      dataOcorrenciaFinal, endereco_completo, ponto_referencia
    ];
    const result = await pool.query(query, values);
    res.status(201).json({ success: true, message: 'Denúncia criada com sucesso!', data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar denúncia:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor ao criar denúncia.' });
  }
});

// ---
// Endpoint: GET /api/denuncias
// ---
app.get('/api/denuncias', auth, async (req, res) => {
  const { id: id_usuario, tipo_usuario } = req.usuario;
  
  // CORREÇÃO: 'd.titulo' removido do SELECT
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
    res.status(500).json({ success: false, error: 'Erro interno do servidor ao buscar denúncias.' });
  }
});

// ---
// Endpoint: POST /api/upload/image
// ---
app.post('/api/upload/image', auth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Nenhum arquivo de imagem enviado.' });
  }
  const id_usuario = req.usuario.id;
  const nomeArquivo = `${id_usuario}/${Date.now()}-${req.file.originalname}`;
  try {
    const { data, error } = await supabase.storage.from('denuncias').upload(nomeArquivo, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (error) { throw error; }
    const { data: publicUrlData } = supabase.storage.from('denuncias').getPublicUrl(nomeArquivo);
    if (!publicUrlData) { throw new Error('Não foi possível obter a URL pública.'); }
    res.status(200).json({ success: true, message: 'Upload de imagem bem-sucedido!', data: { url: publicUrlData.publicUrl } });
  } catch (error) {
    console.error('Erro no upload para o Supabase:', error);
    res.status(500).json({ success: false, error: 'Erro interno ao processar upload da imagem.' });
  }
});

// ---
// Endpoint: PUT /api/denuncias/:id/status
// ---
app.put('/api/denuncias/:id/status', auth, checkGestor, async (req, res) => {
  const { id: id_denuncia } = req.params;
  const { id_status } = req.body;
  if (!id_status) {
    return res.status(400).json({ success: false, error: 'O "id_status" é obrigatório.' });
  }
  try {
    const resDenunciaAtual = await pool.query('SELECT id_status FROM DENUNCIA WHERE id = $1', [id_denuncia]);
    if (resDenunciaAtual.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Denúncia não encontrada.' });
    }
    const statusAtual = resDenunciaAtual.rows[0].id_status;
    if (statusAtual === 3) {
      return res.status(409).json({ success: false, error: 'Conflito: Denúncias já resolvidas não podem ter seu status alterado.' });
    }
    const queryUpdate = `UPDATE DENUNCIA SET id_status = $1 WHERE id = $2 RETURNING *;`;
    const result = await pool.query(queryUpdate, [id_status, id_denuncia]);
    res.status(200).json({ success: true, message: 'Status da denúncia atualizado com sucesso!', data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar status da denúncia:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor ao atualizar status.' });
  }
});

// ---
// Endpoint: PUT /api/denuncias/:id
// ---
app.put('/api/denuncias/:id', auth, async (req, res) => {
    const { id: id_denuncia } = req.params;
    const { id: id_usuario } = req.usuario;
    const { descricao, endereco_completo, ponto_referencia } = req.body;
    try {
        const resDenuncia = await pool.query('SELECT id_usuario FROM DENUNCIA WHERE id = $1 AND is_excluida = false', [id_denuncia]);
        if (resDenuncia.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Denúncia não encontrada.' });
        }
        if (resDenuncia.rows[0].id_usuario !== id_usuario) {
            return res.status(403).json({ success: false, error: 'Acesso negado. Você não é o dono desta denúncia.' });
        }
        const queryUpdate = `UPDATE DENUNCIA SET descricao = $1, endereco_completo = $2, ponto_referencia = $3 WHERE id = $4 RETURNING *;`;
        const values = [descricao || null, endereco_completo || null, ponto_referencia || null, id_denuncia];
        const result = await pool.query(queryUpdate, values);
        res.status(200).json({ success: true, message: 'Denúncia atualizada com sucesso!', data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao editar denúncia:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
    }
});

// ---
// Endpoint: PUT /api/denuncias/:id/excluir
// ---
app.put('/api/denuncias/:id/excluir', auth, async (req, res) => {
    const { id: id_denuncia } = req.params;
    const { id: id_usuario } = req.usuario;
    const { motivo } = req.body;
    if (!motivo) {
        return res.status(400).json({ success: false, error: 'O motivo da exclusão é obrigatório.' });
    }
    try {
        const resDenuncia = await pool.query('SELECT id_usuario FROM DENUNCIA WHERE id = $1 AND is_excluida = false', [id_denuncia]);
        if (resDenuncia.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Denúncia não encontrada.' });
        }
        if (resDenuncia.rows[0].id_usuario !== id_usuario) {
            return res.status(403).json({ success: false, error: 'Acesso negado. Você não é o dono desta denúncia.' });
        }
        const queryDelete = `UPDATE DENUNCIA SET is_excluida = true, motivo_exclusao = $1 WHERE id = $2;`;
        await pool.query(queryDelete, [motivo, id_denuncia]);
        res.status(200).json({ success: true, message: 'Denúncia excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir denúncia:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
    }
});

// ---
// NOVO ENDPOINT: Mudar Senha (Logado)
// Rota: PUT /api/users/me/password
// ---
app.put('/api/users/me/password', auth, async (req, res) => {
  const { id } = req.usuario;
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ success: false, error: 'A senha atual e a nova senha são obrigatórias.' });
  }
  if (novaSenha.length < 6) {
    return res.status(400).json({ success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    // 1. Verificar a senha atual
    const { rows } = await pool.query('SELECT senha_hash FROM USUARIO WHERE id = $1 AND is_ativo = true', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    }
    
    const senhaCorreta = await bcrypt.compare(senhaAtual, rows[0].senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ success: false, error: 'A senha atual está incorreta.' });
    }

    // 2. Criar hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

    // 3. Atualizar no banco
    await pool.query('UPDATE USUARIO SET senha_hash = $1 WHERE id = $2', [novaSenhaHash, id]);

    res.status(200).json({ success: true, message: 'Senha alterada com sucesso!' });

  } catch (error) {
    console.error('Erro ao mudar senha:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

// ---
// NOVO ENDPOINT: Excluir Conta (Logado)
// Rota: DELETE /api/users/me
// ---
app.delete('/api/users/me', auth, async (req, res) => {
  const { id } = req.usuario;
  const { senha } = req.body; // Requer a senha para confirmar

  if (!senha) {
    return res.status(400).json({ success: false, error: 'A senha é obrigatória para excluir a conta.' });
  }

  try {
    // 1. Verificar a senha
    const { rows } = await pool.query('SELECT senha_hash FROM USUARIO WHERE id = $1 AND is_ativo = true', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    }
    
    const senhaCorreta = await bcrypt.compare(senha, rows[0].senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ success: false, error: 'A senha está incorreta.' });
    }

    // 2. Desativar a conta (Soft Delete)
    await pool.query('UPDATE USUARIO SET is_ativo = false WHERE id = $1', [id]);

    // (Opcional: anonimizar dados, mas por enquanto desativar é suficiente)

    res.status(200).json({ success: true, message: 'Conta excluída com sucesso.' });

  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});


// ---
// Iniciar o servidor
// ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor EcoDenúncia rodando na porta ${PORT}`);
});