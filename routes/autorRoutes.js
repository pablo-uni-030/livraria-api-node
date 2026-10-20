const { Router } = require('express');
const controller = require('../controllers/AutorController');
const { autenticarToken, exigirRole } = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @openapi
 * /api/v1/autores:
 *   get:
 *     tags:
 *       - Autores
 *     summary: Listar todos os autores
 *     description: Retorna a listagem de autores cadastrados. Rota pública.
 *     responses:
 *       200:
 *         description: Lista de autores retornada com sucesso.
 *       500:
 *         description: Erro interno no servidor.
 */
router.get('/', (req, res, next) => controller.index(req, res, next));

/**
 * @openapi
 * /api/v1/autores:
 *   post:
 *     tags:
 *       - Autores
 *     summary: Cadastrar novo autor
 *     description: Cadastra um novo autor no sistema. Rota restrita exclusivamente ao perfil ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutorInput'
 *     responses:
 *       201:
 *         description: Autor cadastrado com sucesso.
 *       400:
 *         description: Nome do autor obrigatório.
 *       401:
 *         description: Token JWT não fornecido ou inválido.
 *       403:
 *         description: Acesso proibido (privilégio ADMIN exigido).
 */
router.post('/', autenticarToken, exigirRole('ADMIN'), (req, res, next) => controller.store(req, res, next));

module.exports = router;
