const jwt = require('jsonwebtoken');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'livraria-secret-dev-change-me';

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: "Token de autenticação não fornecido. Use Authorization: Bearer <token>." });
  }

  const token = authHeader.split(' ')[1]; // Extrai após "Bearer "

  if (!token) {
    return res.status(401).json({ erro: "Token de autenticação não fornecido." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

function exigirRole(...rolesEsperadas) {
  // Aceita exigirRole('ADMIN') ou exigirRole('ADMIN', 'USER')
  const permitidas = rolesEsperadas.flat().map(r => String(r).toUpperCase());
  return (req, res, next) => {
    if (!req.usuario || !permitidas.includes(String(req.usuario.role).toUpperCase())) {
      return res.status(403).json({ erro: `Acesso proibido: privilégio de ${permitidas.join(' ou ')} exigido.` });
    }
    next();
  };
}

module.exports = { autenticarToken, exigirRole };