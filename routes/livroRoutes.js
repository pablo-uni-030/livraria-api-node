const { Router } = require('express');
const controller = require('../controllers/LivroController');
const { autenticarToken, exigirRole } = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @openapi
 * /api/v1/livros:
 *   get:
 *     tags:
 *       - Livros
 *     summary: Listar todos os livros
 *     description: Retorna o catálogo completo de livros com autores e comentários. Rota pública.
 *     responses:
 *       200:
 *         description: Lista de livros retornada com sucesso.
 *       500:
 *         description: Erro interno no servidor.
 */
router.get('/', (req, res, next) => controller.index(req, res, next));

/**
 * @openapi
 * /api/v1/livros/{id}:
 *   get:
 *     tags:
 *       - Livros
 *     summary: Buscar livro por ID
 *     description: Retorna detalhes de um livro específico por ID. Rota pública.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livro encontrado.
 *       404:
 *         description: Livro não localizado.
 */
router.get('/:id', (req, res, next) => controller.show(req, res, next));

/**
 * @openapi
 * /api/v1/livros:
 *   post:
 *     tags:
 *       - Livros
 *     summary: Cadastrar novo livro
 *     description: Cadastra um novo livro associado a um autor existente. Rota exclusiva ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LivroInput'
 *     responses:
 *       201:
 *         description: Livro cadastrado com sucesso.
 *       400:
 *         description: Título ou autor_id ausentes.
 *       401:
 *         description: Token JWT não fornecido ou inválido.
 *       403:
 *         description: Acesso proibido (privilégio ADMIN exigido).
 *       404:
 *         description: Autor informado não existe.
 */
router.post('/', autenticarToken, exigirRole('ADMIN'), (req, res, next) => controller.store(req, res, next));

/**
 * @openapi
 * /api/v1/livros/{id}/comentarios:
 *   post:
 *     tags:
 *       - Comentários
 *     summary: Adicionar comentário a um livro
 *     description: Adiciona um comentário/avaliação a um livro. Requer usuário autenticado (USER ou ADMIN).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComentarioInput'
 *     responses:
 *       201:
 *         description: Comentário cadastrado com sucesso.
 *       400:
 *         description: Texto do comentário vazio.
 *       401:
 *         description: Token JWT não fornecido ou inválido.
 *       404:
 *         description: Livro não localizado.
 */
router.post('/:id/comentarios', autenticarToken, (req, res, next) => controller.storeComment(req, res, next));

module.exports = router;
