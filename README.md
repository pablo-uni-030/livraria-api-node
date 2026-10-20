# 📚 Livraria Virtual API - Documentação OpenAPI (Swagger UI) & Segurança RBAC

Esta aplicação consiste em uma **API RESTful** desenvolvida em **Node.js com Express**, estruturada para o gerenciamento de acervo de livros, autores e comentários/resenhas.

A API conta com:
- **Segurança Robusta:** Hash seguro de senhas via **BCrypt** com salt e work factor.
- **Autenticação Stateless:** Emissão e validação de tokens **JWT (JSON Web Token)** no padrão `Bearer`.
- **Controle de Acesso Baseado em Perfis (RBAC):** Proteção de rotas com perfis `USER` e `ADMIN`.
- **Contrato Formal OpenAPI 3.0 (OAS 3.0):** Documentação completa dos endpoints, schemas de entrada/saída, validação de campos obrigatórios e códigos de status HTTP.
- **Interface Interativa Swagger UI:** Suporte a testes diretos pelo navegador com botão **Authorize** funcional para injeção do token JWT.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm (gerenciador de pacotes do Node)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/pablo-uni-030/livraria-api-node.git
   cd livraria-api-node
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
   npm start
   ```
   O servidor iniciará por padrão em `http://localhost:3000`.

---

## 📖 Rotas de Documentação da API

A documentação interativa e os contratos formais estão disponíveis nas seguintes URLs:

| Recurso | Rota | Descrição |
|---|---|---|
| **Interface Interativa (Swagger UI)** | `http://localhost:3000/api/docs` | Interface visual para explorar e testar todos os endpoints (atalhos em `/docs` e `/docs/api`) |
| **Especificação Bruta (JSON)** | `http://localhost:3000/api-docs.json` | Contrato OpenAPI 3.0 em formato JSON bruto (também acessível em `/docs/api.json` e `/api/docs.json`) |
| **Interface de Teste Web (HTML)** | `http://localhost:3000/` | Página web interativa para testes rápidos do catálogo e autenticação |

---

## 🔐 Esquema de Segurança e Autenticação (Security Scheme)

A especificação OpenAPI define o esquema HTTP Bearer JWT:

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### Contas Pré-cadastradas para Testes

| Perfil (Role) | E-mail | Senha | Permissões |
|---|---|---|---|
| **ADMIN** | `admin@livraria.com` | `admin123` | Acesso completo (cadastrar livros, autores, listar e comentar) |
| **USER** | `leitor@gmail.com` | `leitor123` | Leitura pública e publicação de comentários/avaliações em livros |

### Como usar o botão "Authorize" no Swagger UI:
1. Abra `http://localhost:3000/api/docs` no navegador.
2. Expanda o endpoint **`POST /api/v1/auth/login`**, clique em **Try it out** e faça login com uma das contas acima.
3. Copie o valor do campo `"token"` retornado no JSON de sucesso.
4. No topo da página do Swagger, clique no botão verde **Authorize 🔓**.
5. Cole o token no campo de texto e clique em **Authorize**.
6. Agora todos os testes nas rotas protegidas incluirão automaticamente o cabeçalho `Authorization: Bearer <seu_token>`.

---

## 📋 Matriz de Endpoints e Matriz de Permissões (RBAC)

| Método HTTP | Rota (URI) | Perfil de Acesso | Sucesso Esperado | Falhas Documentadas |
|---|---|---|---|---|
| `GET` | `/api/v1/livros` | **Público** (qualquer visitante) | `200 OK` (Array de livros com autor e comentários) | `500 Internal Server Error` |
| `GET` | `/api/v1/livros/{id}` | **Público** | `200 OK` (Detalhes do livro) | `404 Not Found` |
| `POST` | `/api/v1/auth/register` | **Público** | `201 Created` (Dados do usuário sem senha) | `400 Bad Request` (validação), `409 Conflict` (e-mail duplicado) |
| `POST` | `/api/v1/auth/login` | **Público** | `200 OK` (Dados do usuário + Token JWT) | `400 Bad Request` (dados ausentes), `401 Unauthorized` (credenciais inválidas) |
| `POST` | `/api/v1/livros/{id}/comentarios` | **Autenticado** (`USER` ou `ADMIN`) | `201 Created` (Comentário registrado) | `400 Bad Request` (texto vazio), `401 Unauthorized` (token ausente/inválido), `404 Not Found` (livro inexistente) |
| `POST` | `/api/v1/autores` | **Exclusivo ADMIN** | `201 Created` (Autor criado) | `400 Bad Request` (nome ausente), `401 Unauthorized` (sem token), `403 Forbidden` (perfil não-ADMIN) |
| `POST` | `/api/v1/livros` | **Exclusivo ADMIN** | `201 Created` (Livro criado) | `400 Bad Request` (campos ausentes), `401 Unauthorized`, `403 Forbidden`, `404 Not Found` (autor inexistente) |
| `GET` | `/api/v1/autores` | **Público** | `200 OK` (Lista de autores) | `500 Internal Server Error` |

---

## 🛠️ Detalhamento dos Contratos de Entrada (Request Bodies)

### 1. `POST /api/v1/auth/register`
- **Campos Obrigatórios:** `nome` (string), `email` (string), `senha` (string)
- **Campos Opcionais:** `role` (string: `"USER"` ou `"ADMIN"`, padrão `"USER"`)
- **Exemplo:**
  ```json
  {
    "nome": "Carlos Drummond",
    "email": "carlos@livraria.com",
    "senha": "senhaSegura123",
    "role": "USER"
  }
  ```

### 2. `POST /api/v1/auth/login`
- **Campos Obrigatórios:** `email` (string), `senha` (string)
- **Exemplo:**
  ```json
  {
    "email": "admin@livraria.com",
    "senha": "admin123"
  }
  ```

### 3. `POST /api/v1/livros/{id}/comentarios`
- **Campos Obrigatórios:** `texto` (string)
- **Exemplo:**
  ```json
  {
    "texto": "Uma obra-prima incontestável da literatura."
  }
  ```

### 4. `POST /api/v1/autores`
- **Campos Obrigatórios:** `nome` (string)
- **Campos Opcionais:** `nacionalidade` (string)
- **Exemplo:**
  ```json
  {
    "nome": "Clarice Lispector",
    "nacionalidade": "Brasileira"
  }
  ```

### 5. `POST /api/v1/livros`
- **Campos Obrigatórios:** `titulo` (string), `autor_id` (integer)
- **Campos Opcionais:** `ano` (integer)
- **Exemplo:**
  ```json
  {
    "titulo": "Memórias Póstumas de Brás Cubas",
    "ano": 1881,
    "autor_id": 1
  }
  ```

---

## 📦 Estrutura do Projeto

```
livraria-api-node/
├── controllers/          # Controladores da aplicação (Auth, Autor, Livro)
│   ├── AuthController.js
│   ├── AutorController.js
│   └── LivroController.js
├── docs/                 # Documentação formal OpenAPI 3.0
│   ├── swagger.js        # Objeto de especificação OAS 3.0 completo
│   └── swagger.json      # Especificação bruta em JSON
├── middlewares/          # Middlewares de autenticação, RBAC e erros
│   ├── authMiddleware.js # Validação de JWT e guardas de role (exigirRole)
│   └── errorMiddleware.js# Formatador global de respostas de erro
├── repositories/         # Camada de persistência dos dados
│   └── LivrariaRepository.js
├── routes/               # Rotas agrupadas semanticamente (/api/v1)
│   ├── authRoutes.js
│   ├── autorRoutes.js
│   └── livroRoutes.js
├── services/             # Regras de negócio e hashing BCrypt
│   ├── AuthService.js
│   ├── AutorService.js
│   └── LivroService.js
├── index.html            # Interface de testes web
├── package.json          # Dependências do projeto
├── README.md             # Documentação e guia da API
└── server.js             # Entrada da aplicação Express e montagem do Swagger UI
```

---

## 🧪 Tecnologias Utilizadas
- **Node.js** & **Express**
- **swagger-ui-express** & **swagger-jsdoc** (OpenAPI 3.0 / Swagger UI)
- **jsonwebtoken (JWT)** (Autenticação stateless)
- **bcryptjs** (Hashing com salt)
- **cors** & **dotenv**
