// Este middleware assume que 'auth' já foi executado e 'req.usuario' existe.
function checkGestor(req, res, next) {
  if (req.usuario && req.usuario.tipo_usuario === 'gestor') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Acesso negado. Exclusivo para gestores.'
    });
  }
}

module.exports = checkGestor;