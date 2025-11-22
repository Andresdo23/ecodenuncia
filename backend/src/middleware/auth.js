const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // 1. Obter o token do cabeçalho
  const authHeader = req.headers['authorization'];
  
  // O formato é "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Se não houver token, retornar erro 401 (Não Autorizado)
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acesso negado. Nenhum token fornecido.'
    });
  }

  // 3. Verificar se o token é válido
  try {
    const payloadVerificado = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. MELHORIA: Anexar os dados do usuário (payload) ao 'req'
    // Agora, todas as rotas protegidas saberão QUEM fez a requisição
    req.usuario = payloadVerificado;

    // 5. Chamar a próxima função (o endpoint de criar denúncia)
    next();

  } catch (error) {
    // Se o token for inválido (expirado, assinatura errada)
    res.status(400).json({
      success: false,
      error: 'Token inválido.'
    });
  }
}

module.exports = auth;