const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acesso negado. Nenhum token fornecido.'
    });
  }

  try {
    const payloadVerificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payloadVerificado;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Token inválido.'
    });
  }
}

module.exports = auth;