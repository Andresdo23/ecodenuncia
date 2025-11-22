// Este middleware assume que o middleware 'auth' JÁ FOI EXECUTADO
// e que 'req.usuario' existe.

function checkGestor(req, res, next) {
  // 1. Verifica se o usuário (anexado pelo middleware 'auth') é um 'gestor'
  if (req.usuario && req.usuario.tipo_usuario === 'gestor') {
    // 2. Sim, é um gestor. Pode prosseguir.
    next();
  } else {
    // 3. Não, não é gestor. Retornar erro 403 (Proibido).
    res.status(403).json({
      success: false,
      error: 'Acesso negado. Esta rota é exclusiva para gestores.'
    });
  }
}

module.exports = checkGestor;