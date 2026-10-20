/**
 * Especificação OpenAPI 3.0 (OAS 3.0) para a API de Livros e Autores
 * Documentação formal da camada de contratos, segurança JWT e controle de acesso RBAC.
 */

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API de Livros e Autores",
    version: "1.0.0",
    description: `
Esta API fornece uma plataforma de gerenciamento de acervo literário com controle de autenticação stateless (JWT), criptografia de senhas (BCrypt) e controle de acesso baseado em papéis (RBAC).

### Contas Pré-cadastradas para Testes
Para testar a API diretamente nesta interface interativa:
1. **Perfil Administrador (ADMIN):**
   - **E-mail:** \`admin@livraria.com\`
   - **Senha:** \`admin123\`
   - *Permissões:* Acesso total, incluindo cadastro de autores e livros.
2. **Perfil Leitor (USER):**
   - **E-mail:** \`leitor@gmail.com\`
   - **Senha:** \`leitor123\`
   - *Permissões:* Leitura de catálogo e publicação de comentários/resenhas em livros.

### Como Autenticar na Interface Interativa:
1. Acesse o endpoint **\`POST /api/v1/auth/login\`** e execute a requisição com as credenciais desejadas.
2. Copie o valor do campo **\`token\`** retornado na resposta JSON.
3. Clique no botão verde **Authorize** (no topo à direita desta página).
4. Cole o token no campo de texto e clique em **Authorize**. Todas as requisições autenticadas passarão a enviar automaticamente o cabeçalho \`Authorization: Bearer <seu_token>\`.
    `,
    contact: {
      name: "Suporte da API",
      email: "contato@livraria.com"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor Local de Desenvolvimento"
    }
  ],
  tags: [
    {
      name: "Autenticação",
      description: "Endpoints públicos para cadastro de novos usuários e emissão de tokens JWT"
    },
    {
      name: "Livros",
      description: "Consulta pública do catálogo literário e cadastro restrito a administradores"
    },
    {
      name: "Comentários",
      description: "Adição de resenhas e comentários em livros por usuários autenticados"
    },
    {
      name: "Autores",
      description: "Consulta e cadastro de autores de obras literárias"
    }
  ],
  paths: {
    "/api/v1/livros": {
      get: {
        tags: ["Livros"],
        summary: "Listar todos os livros",
        description: "Retorna a listagem completa de livros cadastrados no catálogo, acompanhados de seus autores e comentários associados. Acesso público.",
        responses: {
          "200": {
            description: "Catálogo de livros retornado com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/LivroComDetalhesResponse"
                  }
                },
                example: [
                  {
                    id: 1,
                    titulo: "Dom Casmurro",
                    ano: 1899,
                    autor_id: 1,
                    autor_nome: "Machado de Assis",
                    comentarios: [
                      {
                        id: 1,
                        autor_nome: "Leitor",
                        texto: "Clássico indispensável da literatura brasileira."
                      }
                    ]
                  }
                ]
              }
            }
          },
          "500": {
            description: "Erro interno no servidor ao processar a consulta.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Ocorreu um erro interno no servidor."
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Livros"],
        summary: "Cadastrar novo livro",
        description: "Cadastra um novo título no acervo associado a um autor existente. Rota restrita exclusivamente ao perfil de **ADMIN**.",
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          description: "Dados obrigatórios e complementares para cadastro do livro.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LivroInput"
              },
              example: {
                titulo: "Memórias Póstumas de Brás Cubas",
                ano: 1881,
                autor_id: 1
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Livro cadastrado com sucesso no acervo.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LivroCadastradoResponse"
                },
                example: {
                  id: 1729381048291,
                  titulo: "Memórias Póstumas de Brás Cubas",
                  ano: 1881,
                  autor_id: 1,
                  comentarios: []
                }
              }
            }
          },
          "400": {
            description: "Falha de validação nos dados de entrada (campos obrigatórios ausentes ou inválidos).",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "O título e o autor_id são obrigatórios."
                }
              }
            }
          },
          "401": {
            description: "Não autorizado: token JWT ausente, expirado ou inválido.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Token de autenticação não fornecido. Use Authorization: Bearer <token>."
                }
              }
            }
          },
          "403": {
            description: "Acesso proibido: usuário não possui perfil de administrador (ADMIN).",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Acesso proibido: privilégio de ADMIN exigido."
                }
              }
            }
          },
          "404": {
            description: "Autor referenciado pelo autor_id não foi encontrado.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "O autor informado não existe."
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/livros/{id}": {
      get: {
        tags: ["Livros"],
        summary: "Buscar livro por ID",
        description: "Recupera as informações detalhadas de um livro específico por seu identificador numérico. Acesso público.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identificador numérico do livro",
            schema: {
              type: "integer",
              example: 1
            }
          }
        ],
        responses: {
          "200": {
            description: "Livro encontrado e retornado com sucesso.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LivroComDetalhesResponse"
                },
                example: {
                  id: 1,
                  titulo: "Dom Casmurro",
                  ano: 1899,
                  autor_id: 1,
                  autor_nome: "Machado de Assis",
                  comentarios: [
                    {
                      id: 1,
                      autor_nome: "Leitor",
                      texto: "Clássico indispensável da literatura brasileira."
                    }
                  ]
                }
              }
            }
          },
          "404": {
            description: "Livro não localizado no acervo.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Livro não localizado."
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Autenticação"],
        summary: "Registrar novo usuário",
        description: "Cadastra uma nova conta de usuário. A senha é cifrada com BCrypt (salt rounds 10) e o perfil padrão atribuído é USER, a menos que ADMIN seja explicitamente informado.",
        requestBody: {
          required: true,
          description: "Dados de cadastro do novo usuário.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UsuarioRegistroInput"
              },
              example: {
                nome: "Carlos Drummond",
                email: "carlos@livraria.com",
                senha: "senhaSegura123",
                role: "USER"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Usuário registrado com sucesso. Retorna os dados do usuário sem a senha.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UsuarioResponse"
                },
                example: {
                  id: 1729381048291,
                  nome: "Carlos Drummond",
                  email: "carlos@livraria.com",
                  role: "USER"
                }
              }
            }
          },
          "400": {
            description: "Campos obrigatórios ausentes ou perfil (role) inválido.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Campos obrigatórios ausentes: nome, email ou senha."
                }
              }
            }
          },
          "409": {
            description: "Conflito: endereço de e-mail já registrado no sistema.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "E-mail já cadastrado no sistema."
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Autenticação"],
        summary: "Autenticar usuário e emitir token JWT",
        description: "Valida as credenciais enviadas contra o hash BCrypt seguro. Em caso positivo, gera um token JWT assinado contendo os dados de identidade e perfil (RBAC) do usuário.",
        requestBody: {
          required: true,
          description: "Credenciais de acesso do usuário.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginInput"
              },
              example: {
                email: "admin@livraria.com",
                senha: "admin123"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Autenticação realizada com sucesso. Retorna os dados do usuário e o token Bearer JWT.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse"
                },
                example: {
                  usuario: {
                    id: 1,
                    nome: "Admin",
                    email: "admin@livraria.com",
                    role: "ADMIN"
                  },
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBsaXZyYXJpYS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjkzODAwMDAsImV4cCI6MTcyOTM4MzYwMH0.signature"
                }
              }
            }
          },
          "400": {
            description: "Requisição malformada: e-mail ou senha não fornecidos.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "E-mail e senha são obrigatórios."
                }
              }
            }
          },
          "401": {
            description: "Credenciais inválidas: e-mail não encontrado ou senha incorreta.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Credenciais inválidas."
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/livros/{id}/comentarios": {
      post: {
        tags: ["Comentários"],
        summary: "Adicionar comentário a um livro",
        description: "Permite a um usuário autenticado (**USER** ou **ADMIN**) postar uma avaliação ou comentário sobre um livro existente. O nome do autor do comentário é extraído do token JWT.",
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identificador numérico do livro",
            schema: {
              type: "integer",
              example: 1
            }
          }
        ],
        requestBody: {
          required: true,
          description: "Conteúdo textual da resenha ou comentário.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ComentarioInput"
              },
              example: {
                texto: "Uma obra genial, repleta de ironia fina e reflexão existencial."
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Comentário registrado e anexado ao livro com sucesso.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ComentarioResponse"
                },
                example: {
                  id: 1729381048291,
                  autor_nome: "Leitor",
                  texto: "Uma obra genial, repleta de ironia fina e reflexão existencial."
                }
              }
            }
          },
          "400": {
            description: "Falha de validação: texto do comentário vazio ou em branco.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "O texto do comentário não pode estar vazio."
                }
              }
            }
          },
          "401": {
            description: "Não autorizado: token JWT ausente ou inválido no cabeçalho Authorization.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Token de autenticação não fornecido. Use Authorization: Bearer <token>."
                }
              }
            }
          },
          "404": {
            description: "Livro especificado no caminho ({id}) não foi encontrado.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Livro não localizado."
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/autores": {
      get: {
        tags: ["Autores"],
        summary: "Listar todos os autores",
        description: "Retorna a listagem de autores cadastrados na base de dados. Rota pública.",
        responses: {
          "200": {
            description: "Lista de autores retornada com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/AutorResponse"
                  }
                },
                example: [
                  {
                    id: 1,
                    nome: "Machado de Assis",
                    nacionalidade: "Brasileiro"
                  }
                ]
              }
            }
          },
          "500": {
            description: "Erro interno no servidor ao consultar autores.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Ocorreu um erro interno no servidor."
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Autores"],
        summary: "Cadastrar novo autor",
        description: "Cadastra um novo autor no sistema. Rota restrita exclusivamente ao perfil de administrador (**ADMIN**).",
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          description: "Dados cadastrais do novo autor.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AutorInput"
              },
              example: {
                nome: "Clarice Lispector",
                nacionalidade: "Brasileira"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Autor cadastrado com sucesso.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AutorResponse"
                },
                example: {
                  id: 1729381048291,
                  nome: "Clarice Lispector",
                  nacionalidade: "Brasileira"
                }
              }
            }
          },
          "400": {
            description: "Falha de validação: nome do autor ausente ou em branco.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "O nome do autor é obrigatório."
                }
              }
            }
          },
          "401": {
            description: "Não autorizado: token JWT ausente ou inválido.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Token de autenticação não fornecido. Use Authorization: Bearer <token>."
                }
              }
            }
          },
          "403": {
            description: "Acesso proibido: usuário não possui perfil de administrador (ADMIN).",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                },
                example: {
                  erro: "Acesso proibido: privilégio de ADMIN exigido."
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira o token JWT no formato: Bearer <seu_token>. Obtenha o token através do endpoint POST /api/v1/auth/login."
      }
    },
    schemas: {
      UsuarioRegistroInput: {
        type: "object",
        required: ["nome", "email", "senha"],
        properties: {
          nome: {
            type: "string",
            description: "Nome completo do usuário",
            example: "Carlos Drummond"
          },
          email: {
            type: "string",
            format: "email",
            description: "Endereço eletrônico único para autenticação",
            example: "carlos@livraria.com"
          },
          senha: {
            type: "string",
            format: "password",
            description: "Senha de acesso que será protegida via hash BCrypt",
            example: "senhaSegura123"
          },
          role: {
            type: "string",
            enum: ["USER", "ADMIN"],
            default: "USER",
            description: "Perfil de autorização RBAC do usuário",
            example: "USER"
          }
        }
      },
      UsuarioResponse: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Identificador único do usuário",
            example: 1729381048291
          },
          nome: {
            type: "string",
            description: "Nome completo do usuário",
            example: "Carlos Drummond"
          },
          email: {
            type: "string",
            format: "email",
            description: "Endereço de e-mail do usuário",
            example: "carlos@livraria.com"
          },
          role: {
            type: "string",
            enum: ["USER", "ADMIN"],
            description: "Perfil RBAC do usuário",
            example: "USER"
          }
        }
      },
      LoginInput: {
        type: "object",
        required: ["email", "senha"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "E-mail cadastrado do usuário",
            example: "admin@livraria.com"
          },
          senha: {
            type: "string",
            format: "password",
            description: "Senha de acesso do usuário",
            example: "admin123"
          }
        }
      },
      LoginResponse: {
        type: "object",
        properties: {
          usuario: {
            $ref: "#/components/schemas/UsuarioResponse"
          },
          token: {
            type: "string",
            description: "JSON Web Token (JWT) assinado contendo claims de identidade e permissão",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
        }
      },
      LivroInput: {
        type: "object",
        required: ["titulo", "autor_id"],
        properties: {
          titulo: {
            type: "string",
            description: "Título da obra literária",
            example: "Memórias Póstumas de Brás Cubas"
          },
          ano: {
            type: "integer",
            description: "Ano de publicação da obra (se omitido, assume o ano corrente)",
            example: 1881
          },
          autor_id: {
            type: "integer",
            description: "Identificador numérico do autor existente",
            example: 1
          }
        }
      },
      LivroCadastradoResponse: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Identificador único do livro",
            example: 1729381048291
          },
          titulo: {
            type: "string",
            description: "Título da obra literária",
            example: "Memórias Póstumas de Brás Cubas"
          },
          ano: {
            type: "integer",
            description: "Ano de publicação",
            example: 1881
          },
          autor_id: {
            type: "integer",
            description: "ID do autor associado",
            example: 1
          },
          comentarios: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ComentarioResponse"
            },
            example: []
          }
        }
      },
      LivroComDetalhesResponse: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Identificador único do livro",
            example: 1
          },
          titulo: {
            type: "string",
            description: "Título da obra literária",
            example: "Dom Casmurro"
          },
          ano: {
            type: "integer",
            description: "Ano de publicação",
            example: 1899
          },
          autor_id: {
            type: "integer",
            description: "Identificador do autor",
            example: 1
          },
          autor_nome: {
            type: "string",
            description: "Nome do autor resolvido via relacionamento",
            example: "Machado de Assis"
          },
          comentarios: {
            type: "array",
            description: "Lista de comentários e avaliações do livro",
            items: {
              $ref: "#/components/schemas/ComentarioResponse"
            }
          }
        }
      },
      ComentarioInput: {
        type: "object",
        required: ["texto"],
        properties: {
          texto: {
            type: "string",
            description: "Texto da avaliação, resenha ou comentário sobre a obra",
            example: "Uma leitura fascinante com reviravoltas psicológicas profundas."
          }
        }
      },
      ComentarioResponse: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Identificador único do comentário",
            example: 1729381048291
          },
          autor_nome: {
            type: "string",
            description: "Nome do usuário que publicou o comentário",
            example: "Leitor"
          },
          texto: {
            type: "string",
            description: "Texto do comentário",
            example: "Uma leitura fascinante com reviravoltas psicológicas profundas."
          }
        }
      },
      AutorInput: {
        type: "object",
        required: ["nome"],
        properties: {
          nome: {
            type: "string",
            description: "Nome completo do autor",
            example: "Clarice Lispector"
          },
          nacionalidade: {
            type: "string",
            description: "País ou nacionalidade de origem do autor",
            example: "Brasileira"
          }
        }
      },
      AutorResponse: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Identificador numérico do autor",
            example: 1
          },
          nome: {
            type: "string",
            description: "Nome completo do autor",
            example: "Clarice Lispector"
          },
          nacionalidade: {
            type: "string",
            description: "Nacionalidade do autor",
            example: "Brasileira"
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          erro: {
            type: "string",
            description: "Mensagem descritiva detalhando o motivo do erro",
            example: "Mensagem de erro explicativa."
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
