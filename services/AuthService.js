const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('../repositories/LivrariaRepository');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'livraria-secret-dev-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = 10;

class AuthService {
  async registrar({ nome, email, senha, role }) {
    if (!nome || !email || !senha) {
      throw { status: 400, message: "Campos obrigatórios ausentes: nome, email ou senha." };
    }

    const usuarioExistente = repository.buscarUsuarioPorEmail(email);
    if (usuarioExistente) {
      throw { status: 409, message: "E-mail já cadastrado no sistema." };
    }

    // Armazenamento seguro: BCrypt com salt + work factor (10 rounds)
    const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

    // RBAC: normaliza o perfil; padrão USER. Aceita apenas USER ou ADMIN.
    let perfil = "USER";
    if (role) {
      const normalizada = String(role).toUpperCase();
      if (!["USER", "ADMIN"].includes(normalizada)) {
        throw { status: 400, message: "Role inválida. Use USER ou ADMIN." };
      }
      perfil = normalizada;
    }

    const novoUsuario = repository.salvarUsuario({
      nome,
      email,
      senha_hash,
      role: perfil
    });

    const { senha_hash: _, ...usuarioRetorno } = novoUsuario;
    return usuarioRetorno;
  }

  async login({ email, senha }) {
    if (!email || !senha) {
      throw { status: 400, message: "E-mail e senha são obrigatórios." };
    }

    const usuario = repository.buscarUsuarioPorEmail(email);
    if (!usuario) {
      throw { status: 401, message: "Credenciais inválidas." };
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaConfere) {
      throw { status: 401, message: "Credenciais inválidas." };
    }

    // Autenticação stateless: emissão de JWT padrão Bearer
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
      token
    };
  }
}

module.exports = new AuthService();