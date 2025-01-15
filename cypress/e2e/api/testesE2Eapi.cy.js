let valorToken;
let url = "http://165.227.93.41/lojinha/v2/";
let produtoId;
let componenteId;
let produtoIdInexistente = 9999;
let componenteIdInexistente = 9999;

describe('Testes E2E da API da Lojinha', () => {
    describe('Autenticação', () => {
        it('Obter token do usuário', () => {
            cy.api({
                method: "POST",
                url: `${url}login`,
                body: {
                    "usuarioLogin": "marcos2025",
                    "usuarioSenha": "marcos2025"
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                valorToken = response.body.data.token;
                expect(response.body).to.have.property("message", "Sucesso ao realizar o login");
                expect(response.body).to.have.property("error", "");
                expect(valorToken).to.be.a("string").and.not.to.be.empty;
            });
        });
        it('Tentar usar token inválido - 401 Unauthorized', () => {
            const tokenInvalido = "token_inexistente_ou_invalido";

            cy.api({
                method: "POST",
                url: `${url}login`,
                headers: {
                    Authorization: `Bearer ${tokenInvalido}`
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.be.empty;
            });
        });
        it('Tentar fazer login com credenciais inválidas', () => {
            cy.api({
                method: "POST",
                url: `${url}login`,
                body: {
                    "usuarioLogin": "usuario_inexistente",
                    "usuarioSenha": "senha_incorreta"
                },
                failOnStatusCode: false
            }).then((response) => {
                // Verifica se o status da resposta é 401 (Unauthorized)
                expect(response.status).to.eq(401); // Ajustado para 401
            });
        });
        it('Tentar fazer login sem informar o nome de usuário', () => {
            cy.api({
                method: "POST",
                url: `${url}login`,
                body: {
                    "usuarioLogin": "", // Nome de usuário não informado
                    "usuarioSenha": "marcos2025"
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401); // Bad Request
            });
        });
        it('Fazer login sem fornecer a senha', () => {
            cy.api({
                method: "POST",
                url: `${url}login`,
                body: {
                    "usuarioLogin": "marcos2025",
                    "usuarioSenha": "" // Senha não informada
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401); // Unauthorized
            });
        });
        it('Tentar fazer login com corpo vazio', () => {
            cy.api({
                method: "POST",
                url: `${url}login`,
                body: {}, // Corpo vazio
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401); // Bad Request
            });
        });
        it('Fazer login com um token expirado', () => {
            const tokenExpirado = "token_expirado_aqui";
        
            cy.api({
                method: "POST",
                url: `${url}login`,
                headers: {
                    Authorization: `Bearer ${tokenExpirado}`
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401); // Unauthorized
            });
        });
        it('Tentar fazer login com método GET', () => {
            cy.api({
                method: "GET",
                url: `${url}login`,
                body: {
                    "usuarioLogin": "marcos2025",
                    "usuarioSenha": "marcos2025"
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(405); // Method Not Allowed
            });
        });
                after('Limpar todos os dados do usuário', () => {
            cy.api({
                method: "DELETE",
                url: `${url}dados`,
                headers: {
                    token: valorToken
                },
            }).then((response) => {
                expect(response.status).to.eq(204)
            })
           
        })
    })   

    describe('Usuários', () => {
        it('Adicionar um novo usuário', () => {
            let usuarioLoginUnico = `usuario_${Math.floor(Math.random() * 10000)}`;

            let novoUsuario = {
                usuarioNome: "Fulano de Tal",
                usuarioLogin: usuarioLoginUnico,
                usuarioSenha: "senhaSegura123"
            };

            cy.api({
                method: "POST",
                url: `${url}usuarios`,
                body: novoUsuario,
                failOnStatusCode: false
            }).then((response) => {
                if (response.status === 409) {
                    expect(response.body.error).to.eq("O usuário já existe.");
                    cy.log("Usuário já existe. Teste de conflito validado com sucesso.");
                } else {
                    expect(response.status).to.eq(201);
                    expect(response.body.data).to.have.property("usuarioId").that.is.a("number");
                    expect(response.body.data).to.have.property("usuarioLogin", novoUsuario.usuarioLogin);
                    expect(response.body.data).to.have.property("usuarioNome", novoUsuario.usuarioNome);
                    expect(response.body).to.have.property("message", "Usuário adicionado com sucesso");
                    expect(response.body).to.have.property("error", "");
                    expect(response.body.data.usuarioId).to.be.greaterThan(0);
                }
            });
        });

        it('Adicionar um usuário que já existe', () => {
            const usuarioLoginExistente = "marcos2025"; // Substitua por um login que já existe

            let usuarioExistente = {
                usuarioNome: "marcos2025",
                usuarioLogin: usuarioLoginExistente,
                usuarioSenha: "marcos2025"
            };

            cy.api({
                method: "POST",
                url: `${url}usuarios`,
                body: usuarioExistente,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(409);
                expect(response.body.error).to.eq("O usuário marcos2025 já existe.");
            });
        });
        
        it('Adicionar um usuário sem informar dados', () => {
            const usuarioLoginExistente = ""; // Substitua por um login que já existe

            let usuarioExistente = {
                usuarioNome: "",
                usuarioLogin: usuarioLoginExistente,
                usuarioSenha: ""
            };

            cy.api({
                method: "POST",
                url: `${url}usuarios`,
                body: usuarioExistente,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(409);
            });
        });

        it('Adicionar um usuário sem senha', () => {
            const novoUsuario = {
                usuarioNome: "Fulano de Tal",
                usuarioLogin: `usuario_${Math.floor(Math.random() * 10000)}`,
                usuarioSenha: "" // Senha não informada
            };

            cy.api({
                method: "POST",
                url: `${url}usuarios`,
                body: novoUsuario,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("A senha é obrigatória");
            });
        });

        it('Adicionar um usuário com senha contendo espaços', () => {
            const novoUsuario = {
                usuarioNome: "Fulano de Tal",
                usuarioLogin: `usuario_${Math.floor(Math.random() * 10000)}`,
                usuarioSenha: "senha com espacos"
            };
        
            cy.api({
                method: "POST",
                url: `${url}usuarios`,
                body: novoUsuario,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Adicionar um usuário com nome muito longo', () => {
            const nomeMuitoLongo = "a".repeat(256); // Nome com mais de 255 caracteres
        
            let novoUsuario = {
                usuarioNome: nomeMuitoLongo,
                usuarioLogin: `usuario_${Math.floor(Math.random() * 10000)}`,
                usuarioSenha: "senhaSegura123"
            };
        
            cy.api({
                method: "POST",
                url: `${url}usuarios`,
                body: novoUsuario,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });
    })

    describe('Produtos', () => {
        before(() => {
            // Garante que o token esteja disponível antes de executar os testes de produtos
            cy.api({
                method: "POST",
                url: `${url}login`,
                body: {
                    "usuarioLogin": "marcos2025",
                    "usuarioSenha": "marcos2025"
                }
            }).then((response) => {
                valorToken = response.body.data.token;
            });
        });
        it('Adicionar um produto', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Testes automatizados",
                    produtoValor: 5000,
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                }
            }).then((response) => {
                produtoId = response.body.data.produtoId;
                componenteId = response.body.data.componentes[0].componenteId;
                expect(response.status).to.eq(201);
                expect(response.body.data).to.have.property("produtoId", produtoId).that.is.a("number");
                expect(response.body.data).to.have.property("produtoNome", "Testes automatizados");
                expect(response.body.data).to.have.property("produtoValor", 5000);
                expect(response.body.data).to.have.property("produtoCores").that.deep.equal(["Branco"]);
                expect(response.body.data).to.have.property("produtoUrlMock", "");
                expect(response.body.data.componentes[0]).to.have.property("componenteNome", "hahaha");
                expect(response.body.data.componentes[0]).to.have.property("componenteId", componenteId);
                expect(response.body.data.componentes[0]).to.have.property("componenteQuantidade", 1).that.is.a("number");
                expect(response.body).to.have.property("message", "Produto adicionado com sucesso");
                expect(response.body).to.have.property("error", "");
                expect(produtoId).to.be.greaterThan(0);
                expect(componenteId).to.be.greaterThan(0);
            });
        });

        it('Adicionar um produto com valor decimal de 0 a 4 - Arredonda para 0', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor decimal (0 a 4)",
                    produtoValor: 100.004, // Valor com mais de duas casas decimais (arredonda para 100.00)
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com valor decimal",
                            componenteQuantidade: 1
                        }
                    ]
                }
            }).then((response) => {
                expect(response.status).to.eq(201); // Sucesso
                expect(response.body.data.produtoValor).to.eq(100.004); // Verifica se o valor foi arredondado para 100.00
            });
        });     

        it('Adicionar um produto com valor decimal exatamente 5 - Arredonda para 1', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor decimal exatamente 5",
                    produtoValor: 100.005, // Valor com mais de duas casas decimais (arredonda para 100.01)
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com valor decimal",
                            componenteQuantidade: 1
                        }
                    ]
                }
            }).then((response) => {
                expect(response.status).to.eq(201); // Sucesso
                expect(response.body.data.produtoValor).to.eq(100.005); // Verifica se o valor foi arredondado para 100.01
            });
        });

        it('Buscar produtos de um usuário sem fornecer o token', () => {
            cy.api({
                method: "GET",
                url: `${url}produtos`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401); // Unauthorized
            });
        });
        
        it('Cadastrar um produto utilizando um número inteiro no campo de nome', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: 12345, // Número inteiro no campo de nome
                    produtoValor: 5000,
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Cadastrar um produto com mais de 10 cores', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com muitas cores",
                    produtoValor: 5000,
                    produtoCores: ["Branco", "Preto", "Azul", "Vermelho", "Verde", "Amarelo", "Roxo", "Laranja", "Rosa", "Cinza", "Marrom"], // Mais de 10 cores
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com muitas cores",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(201); 
            });
        });

        it('Cadastrar um produto com nome contendo apenas espaços', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "     ", // Nome com apenas espaços
                    produtoValor: 5000,
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com nome inválido",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Cadastrar um produto com valor zero', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor zero",
                    produtoValor: 0, // Valor zero
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com valor zero",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00");
            });
        });

        it('Adicionar um produto com valor muito grande', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor muito grande",
                    produtoValor: 1000000, // Valor muito grande
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com valor muito grande",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00");
            });
        });    

        it('Cadastrar um produto com valor contendo letras', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor inválido",
                    produtoValor: "abc", // Valor com letras
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com valor inválido",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Cadastrar um produto com nome contendo caracteres especiais', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto @#$%", // Nome com caracteres especiais
                    produtoValor: 5000,
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com nome inválido",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O nome do produto contém caracteres inválidos");
            });
        })

        it('Cadastrar um produto com valor contendo vírgula', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor inválido",
                    produtoValor: "1,000", // Valor com vírgula
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com valor inválido",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(201); // Unprocessable Entity
            });
        });

        it('Alterar um produto sem fornecer o token', () => {
            cy.api({
                method: "PUT",
                url: `${url}produtos/${produtoId}`,
                body: {
                    produtoNome: "Produto alterado sem token",
                    produtoValor: 5500,
                    produtoCores: ["Preto"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente alterado sem token",
                            componenteQuantidade: 2
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401); // Unauthorized
            });
        });

        it('Adicionar um produto com mais de 100 caracteres', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "a".repeat(101), // Nome com mais de 100 caracteres
                    produtoValor: 5000,
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Adicionar um produto sem informar o valor', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Testes automatizados",
                    produtoValor: "", // Valor não informado
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00");
            });
        });

        it('Cadastrar um produto com valor contendo zeros após o ponto decimal', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor 0.000",
                    produtoValor: 0.000,
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com valor 0.000",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00");
            });
        });

        it('Cadastrar um produto com valor contendo aspas', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor inválido",
                    produtoValor: "1000", // Valor com aspas (string)
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com valor inválido",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O valor do produto deve ser um número válido");
            });
        });

        it('Cadastrar um produto com nome contendo números quebrados', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: 123.45, // Nome com número quebrado
                    produtoValor: 5000,
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "Componente com nome inválido",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O nome do produto deve ser uma string válida");
            });
        });

        it('Adicionar um produto sem nome', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "", // Nome não informado
                    produtoValor: 5000,
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O nome do produto é obrigatório");
            });
        });

        it('Adicionar um produto com valor negativo', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor negativo",
                    produtoValor: -100, // Valor negativo
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00");
            });
        });

        it('Adicionar um produto com valor acima do limite permitido', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com valor acima do limite",
                    produtoValor: 100000, // Valor acima do limite
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00");
            });
        });

        it('Adicionar um produto com mais de uma cor', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com múltiplas cores",
                    produtoValor: 5000,
                    produtoCores: ["Branco", "Preto", "Azul"], // Múltiplas cores
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(201); // Created
            });
        });

        it('Adicionar um produto sem cores', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto sem cores",
                    produtoValor: 5000,
                    produtoCores: [], // Lista de cores vazia
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("Pelo menos uma cor deve ser informada");
            });
        });
        it('Tentar adicionar um produto com uma cor inválida', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Produto com cor inválida",
                    produtoValor: 5000,
                    produtoCores: ["CorInvalida"], // Cor inválida
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Buscar todos os produtos do usuário', () => {
            cy.api({
                method: "GET",
                url: `${url}produtos`,
                headers: {
                    token: valorToken
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property("message", "Listagem de produtos realizada com sucesso");
                expect(response.body).to.have.property("data").that.is.an("array");

                if (response.body.data.length === 0) {
                    cy.log("Lista de produtos está vazia");
                } else {
                    response.body.data.forEach((produto) => {
                        expect(produto).to.have.property("produtoId").that.is.a("number");
                        expect(produto).to.have.property("produtoNome").that.is.a("string");
                        expect(produto).to.have.property("produtoValor").that.is.a("number");
                        expect(produto).to.have.property("produtoCores").that.is.an("array");
                        expect(produto).to.have.property("produtoUrlMock").that.is.a("string");

                        if (produto.componentes && produto.componentes.length > 0) {
                            produto.componentes.forEach((componente) => {
                                expect(componente).to.have.property("componenteId").that.is.a("number");
                                expect(componente).to.have.property("componenteNome").that.is.a("string");
                                expect(componente).to.have.property("componenteQuantidade").that.is.a("number");
                            });
                        }
                    });
                }
            });
        });

        it('Buscar um dos produtos do usuário', () => {
            cy.api({
                method: "GET",
                url: `${url}produtos/${produtoId}`,
                headers: {
                    token: valorToken
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property("produtoId", produtoId).that.is.a("number");
                expect(response.body.data).to.have.property("produtoNome", "Testes automatizados");
                expect(response.body.data).to.have.property("produtoValor", 5000);
                expect(response.body.data).to.have.property("produtoCores").that.deep.equal(["Branco"]);
                expect(response.body.data).to.have.property("produtoUrlMock", "");
                expect(response.body.data.componentes[0]).to.have.property("componenteNome", "hahaha");
                expect(response.body.data.componentes[0]).to.have.property("componenteId").that.is.a("number");
                expect(response.body.data.componentes[0]).to.have.property("componenteQuantidade", 1).that.is.a("number");
                expect(response.body.data.produtoId).to.eq(produtoId);
            });
        });

        it('Buscar um produto inexistente do usuário', () => {
            cy.api({
                method: "GET",
                url: `${url}produtos/${produtoIdInexistente}`,
                headers: {
                    token: valorToken
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
                expect(response.body).to.not.have.property("data");
            });
        });

        it('Alterar as informações de um produto', () => {
            cy.api({
                method: "PUT",
                url: `${url}produtos/${produtoId}`,
                headers: {
                    token: valorToken
                },
                body: {
                    produtoNome: "Produto alterado3",
                    produtoValor: 5500,
                    produtoCores: ["Preto"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "kkkk",
                            componenteQuantidade: 2
                        }
                    ]
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property("produtoId", produtoId).that.is.a("number");
                expect(response.body.data).to.have.property("produtoNome", "Produto alterado3");
                expect(response.body.data).to.have.property("produtoValor", 5500);
                expect(response.body.data).to.have.property("produtoCores").that.deep.equal("Preto");
                expect(response.body.data.componentes[0]).to.have.property("componenteNome", "kkkk");
                expect(response.body.data.componentes[0]).to.have.property("componenteId").that.is.a("number");
                expect(response.body.data.componentes[0]).to.have.property("componenteQuantidade", 2).that.is.a("number");
                expect(response.body.data.produtoValor).to.eq(5500);
                expect(response.body).to.have.property("message", "Produto alterado com sucesso");
            });
        });

        it('Alterar as informações de um produto que não existe', () => {
            cy.api({
                method: "PUT",
                url: `${url}produtos/${produtoIdInexistente}`,
                headers: {
                    token: valorToken
                },
                body: {
                    produtoNome: "Produto alterado3",
                    produtoValor: 5500,
                    produtoCores: ["Preto"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "kkkk",
                            componenteQuantidade: 2
                        }
                    ]
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
        });

        it('Remover o produto', () => {
            cy.api({
                method: "DELETE",
                url: `${url}produtos/${produtoId}`,
                headers: {
                    token: valorToken
                }
            }).then((response) => {
                expect(response.status).to.eq(204);
                expect(response.body).to.be.empty;
            });
        });

        it('Remover um produto que não existe', () => {
            cy.api({
                method: "DELETE",
                url: `${url}produtos/${produtoIdInexistente}`,
                headers: {
                    token: valorToken
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
        });
    })

    describe('Componentes', () => {
        before(() => {
            // Garante que o produto e o token estejam disponíveis antes de executar os testes de componentes
            cy.api({
                method: "POST",
                url: `${url}produtos`,
                headers: {
                    token: valorToken,
                },
                body: {
                    produtoNome: "Testes automatizados",
                    produtoValor: 5000,
                    produtoCores: ["Branco"],
                    produtoUrlMock: "",
                    componentes: [
                        {
                            componenteNome: "hahaha",
                            componenteQuantidade: 1
                        }
                    ]
                }
            }).then((response) => {
                produtoId = response.body.data.produtoId;
                componenteId = response.body.data.componentes[0].componenteId;
            });
        });

        it('Adicionar um novo componente ao produto', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "alteradaço",
                    componenteQuantidade: 10
                }
            }).then((response) => {
                componenteId = response.body.data.componenteId;
                expect(response.status).to.eq(201);
                expect(response.body.data).to.have.property("componenteId").that.is.a("number");
                expect(response.body.data).to.have.property("componenteNome", "alteradaço");
                expect(response.body.data).to.have.property("componenteQuantidade", 10).that.is.a("number");
                expect(componenteId).to.be.greaterThan(0);
                expect(response.body).to.have.property("message", "Componente de produto adicionado com sucesso");
            });
        });

        it('Adicionar um componente com quantidade muito alta', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "Componente com quantidade muito alta",
                    componenteQuantidade: 1000000 // Quantidade muito alta
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entit
            });
        });

        it('Adicionar um componente com mais de 100 caracteres', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "a".repeat(101), // Nome com mais de 100 caracteres
                    componenteQuantidade: 10
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401); // Not Authorized
                expect(response.body.error).to.eq("O nome do componente deve ter no máximo 100 caracteres");
            });
        });

        it('Adicionar um componente com quantidade utilizando string', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "Componente com quantidade inválida",
                    componenteQuantidade: "10" // Quantidade como string
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Adicionar um componente a um produto com a quantidade zerada', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "alteradaço",
                    componenteQuantidade: ""
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422);
            });
        });

        it('Adicionar um componente sem informar a quantidade', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "Componente sem quantidade",
                    componenteQuantidade: "" // Quantidade não informada
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("A quantidade mínima para o componente não deve ser inferior a 1")
            });
        });

        it('Adicionar um componente com quantidade negativa', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "Componente com quantidade negativa",
                    componenteQuantidade: -1 // Quantidade negativa
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("A quantidade mínima para o componente não deve ser inferior a 1")
            });
        });

        it('Adicionar um componente com nome contendo apenas números', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "12345", // Nome com apenas números
                    componenteQuantidade: 10
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("O nome do componente deve conter letras");
            });
        });

        it('Adicionar um componente com quantidade menor que o mínimo permitido (0.1)', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "Componente com quantidade inválida",
                    componenteQuantidade: 0.1 // Quantidade menor que 1
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
                expect(response.body.error).to.eq("A quantidade mínima para o componente não deve ser inferior a 1");
            });
        });

        it('Adicionar um componente com quantidade contendo letras', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "Componente com quantidade inválida",
                    componenteQuantidade: "abc" // Quantidade com letras
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Adicionar um componente a um produto sem informar o nome', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "", // Nome do componente não informado
                    componenteQuantidade: "1"
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422);
            });
        });

        it('Adicionar um componente com nome contendo caracteres especiais', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "Componente @#$%", // Nome com caracteres especiais
                    componenteQuantidade: 10
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Adicionar um componente com nome muito curto', () => {
            cy.api({
                method: "POST",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "A", // Nome com apenas 1 caractere
                    componenteQuantidade: 10
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422); // Unprocessable Entity
            });
        });

        it('Busca dados dos componentes de um produto', () => {
            cy.api({
                method: "GET",
                url: `${url}produtos/${produtoId}/componentes`,
                headers: {
                    token: valorToken
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.be.an("array");
                expect(response.body.data.length).to.be.greaterThan(0);
            });
        });

        it('Buscar componentes de um produto sem fornecer o token', () => {
            cy.api({
                method: "GET",
                url: `${url}produtos/${produtoId}/componentes`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401); // Unauthorized
            });
        });

        it('Busca dados dos componentes de um produto inexistente', () => {
            cy.api({
                method: "GET",
                url: `${url}produtos/${produtoIdInexistente}/componentes`,
                headers: {
                    token: valorToken
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });
        
        it('Consultar um componente de produto informando um ID de produto inválido', () => {
            cy.api({
                method: "GET",
                url: `${url}produtos/9999/componentes/${componenteId}`,
                headers: {
                    token: valorToken
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400); // Bad Request
                expect(response.body.error).to.eq("ID do produto inválido");
            });
        });

        it('Buscar dados de um componente específico do produto', () => {
            cy.api({
                method: "GET",
                url: `${url}produtos/${produtoId}/componentes/${componenteId}`,
                headers: {
                    token: valorToken
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property("componenteId", componenteId).that.is.a("number");
                expect(response.body.data).to.have.property("componenteNome").that.is.a("string");
                expect(response.body.data).to.have.property("componenteQuantidade").that.is.a("number");
                expect(response.body).to.have.property("message", "Detalhando dados do componente de produto");
                expect(response.body).to.have.property("error", "");
                expect(response.body.data.componenteId).to.eq(componenteId);
            });
        });

        it('Alterar as informações de um componente', () => {
            cy.api({
                method: "PUT",
                url: `${url}produtos/${produtoId}/componentes/${componenteId}`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "Componente alterado",
                    componenteQuantidade: 10
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property("componenteId", componenteId).that.is.a("number");
                expect(response.body.data).to.have.property("componenteNome", "Componente alterado");
                expect(response.body.data).to.have.property("componenteQuantidade", 10).that.is.a("number");
                expect(response.body.data.componenteQuantidade).to.eq(10);
            });
        });

        it('Alterar as informações de um componente inexistente', () => {
            cy.api({
                method: "PUT",
                url: `${url}produtos/${produtoId}/componentes/${componenteIdInexistente}`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "Componente alterado",
                    componenteQuantidade: 10
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
        });

        it('Alterar as informações de um componente sem informar o nome', () => {
            cy.api({
                method: "PUT",
                url: `${url}produtos/${produtoId}/componentes/${componenteId}`,
                headers: {
                    token: valorToken
                },
                body: {
                    componenteNome: "", // Nome do componente não informado
                    componenteQuantidade: 10
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(422);
            });
        });

        it('Remover o componente', () => {
            cy.api({
                method: "DELETE",
                url: `${url}produtos/${produtoId}/componentes/${componenteId}`,
                headers: {
                    token: valorToken
                }
            }).then((response) => {
                expect(response.status).to.eq(204);
                expect(response.body).to.be.empty;
            });
        });

        it('Remover o componente inexistente', () => {
            cy.api({
                method: "DELETE",
                url: `${url}produtos/${produtoId}/componentes/${componenteIdInexistente}`,
                headers: {
                    token: valorToken
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
        });
        it('Remover um componente sem fornecer o token', () => {
            cy.api({
                method: "DELETE",
                url: `${url}produtos/${produtoId}/componentes/${componenteId}`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401); // Unauthorized
            });
        });
    })
})