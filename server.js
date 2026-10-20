const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const authRoutes = require('./routes/authRoutes');
const livroRoutes = require('./routes/livroRoutes');
const autorRoutes = require('./routes/autorRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Especificação OpenAPI Bruta em JSON
app.get(['/api-docs.json', '/docs/api.json', '/api/docs.json', '/docs/swagger.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return res.json(swaggerSpec);
});

// Documentação Interativa Swagger UI (OAS 3.0)
const swaggerUiOptions = {
  customSiteTitle: 'Documentação da API de Livros - Swagger UI',
  swaggerOptions: {
    persistAuthorization: true
  }
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/docs', (req, res) => res.redirect('/api/docs'));
app.get('/docs/api', (req, res) => res.redirect('/api/docs'));

// Servir tela inicial/HTML de testes se acessado na raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Agrupamento Semântico de Rotas (RESTful /api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/livros', livroRoutes);
app.use('/api/v1/autores', autorRoutes);

// Middleware Global de Tratamento de Erros
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Livraria API rodando em http://localhost:${PORT}`);
    console.log(`Documentação Swagger UI disponível em http://localhost:${PORT}/api/docs`);
    console.log(`Especificação OpenAPI JSON em http://localhost:${PORT}/api-docs.json`);
  });
}

module.exports = app;
