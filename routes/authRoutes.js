const { Router } = require('express');
const controller = require('../controllers/AuthController');

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Registrar novo usuário
 *     description: Cadastra um novo usuário no sistema com senha hasheada por BCrypt.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioRegistroInput'
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso.
 *       400:
 *         description: Dados obrigatórios ausentes ou role inválida.
 *       409:
 *         description: E-mail já cadastrado.
 */
router.post('/register', (req, res, next) => controller.register(req, res, next));

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Autenticar usuário e emitir token JWT
 *     description: Realiza login e gera token JWT stateless para autorização Bearer.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login bem-sucedido com emissão de token JWT.
 *       400:
 *         description: E-mail ou senha não informados.
 *       401:
 *         description: Credenciais inválidas.
 */
router.post('/login', (req, res, next) => controller.login(req, res, next));

module.exports = router;
