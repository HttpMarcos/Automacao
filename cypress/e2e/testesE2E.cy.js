const { faker } = require("@faker-js/faker")

const usuario = Cypress.env("username")
const senha = Cypress.env("password")

describe('Fluxo E2E', () => {
    beforeEach(() => {
        cy.login(usuario, senha) // Login antes de cada teste
    })
    
    it('Deve realizar o login com sucesso', () => {
        // Executa o comando de login com as variáveis 'usuario' e 'senha' passadas como argumento
        cy.login(usuario, senha)

        // Verifica se a URL é a página inicial após o login
        cy.url().should('eq', 'http://165.227.93.41/lojinha-web/v2/produto')

        // Verifica se o botão de logout está visível (indicando que o login foi bem-sucedido)
        cy.get('a[href="http://165.227.93.41/lojinha-web/v2/login/sair"]').should('be.visible')
        
        // Captura uma evidência visual do resultado
        cy.screenshot()
    });
    it('Criar um produto com sucesso', () => {
        cy.cadastrarProduto("Playstation", "3000", "Branca")
        cy.get('.toast').should('be.visible').and('contain.text', 'Produto adicionado com sucesso')
        cy.screenshot()
    })

    it('Editar um produto existente', () => {
        cy.editaProduto("Iphone 14", "50.08", "Azul")
        cy.get('.toast').should('be.visible').and('contain.text', 'Produto alterado com sucesso')
        cy.screenshot()
    })

    it('Adicionar componente ao produto', () => {
        
        cy.adicionarComponente("Head set", "1")
        cy.get('.toast').should('be.visible').and('contain.text', 'Componente de produto adicionado com sucesso')
        cy.screenshot() 
    })

    it('Deve listar produtos e voltar para o menu inicial', () => {
        cy.listaProduto()
        cy.url().should('eq', 'http://165.227.93.41/lojinha-web/v2/produto')
        cy.screenshot()
    })
    it('logout', () => {
        // Certifica-se de que o usuário está logado antes de realizar o logout
        cy.login(Cypress.env("username"), Cypress.env("password"))

        // Executa o comando de logout
        cy.logout()
        // Verifica que foi redirecionado para a tela de login após o logout
        cy.url().should('eq', 'http://165.227.93.41/lojinha-web/v2/') 
        // Captura uma evidência visual do resultado
        cy.screenshot()       
    })
})

describe('Cadastrar produto com valor não permitido', () => {
    beforeEach(() => {
        cy.login(usuario, senha) // Login antes de cada teste
    });

   
    it('Criar um produto com valor > R$7000,01', () => { 
        cy.cadastrarProduto("Iphone 12", "7.000,01", "Vermelho");
    
        // Esperar o Toast aparecer e verificar a mensagem de erro
        cy.get('.toast').should('be.visible').and('contain.text', 'O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00')
    
        // Verificar a URL de erro
        cy.url().should('eq', 'http://165.227.93.41/lojinha-web/v2/produto?error=O%20valor%20do%20produto%20deve%20estar%20entre%20R$%200,01%20e%20R$%207.000,00')
        
        // Tirar uma captura de tela
        cy.screenshot();
    });
        

    it('Criar produto com valor zerado', () => {
        // Chamando o comando cadastrarProduto com os parâmetros corretos
        cy.cadastrarProduto("Iphone 4", "0", "Preto");  // Valor zerado
        cy.wait(100)
        
        // Esperar o Toast aparecer e verificar a mensagem
        cy.get('.toast').should('be.visible').and('contain.text', 'O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00');
        
        // Tirar uma captura de tela
        cy.screenshot();
    });
    
    it('Criar produto com valor em branco', () => {
        cy.cadastrarProduto("Iphone 4", "", "Preto"); // Não preenche o valor
        cy.wait(100)
        
        // Esperar o Toast aparecer e verificar a mensagem
        cy.get('.toast').should('be.visible').and('contain.text', 'O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00');
        
        // Tirar uma captura de tela
        cy.screenshot();
    });
});


describe('Login inválido', () => {
    it('Login com credenciais inválidas', () => {
        cy.login(faker.person.firstName(), faker.internet.password())
        // Ajustar validação de URL para verificar somente o erro
        cy.url().should('include', '?error=Falha%20ao%20fazer%20o%20login')
        cy.get('.toast').should('be.visible').and('contain.text', 'Falha ao fazer o login')
        cy.screenshot()        
    })
})
    describe('Excluir Produto', () => {
        beforeEach(() => {
            cy.login(usuario, senha) // Login antes de cada teste
        })
        it('Deve excluir o primeiro produto da lista', () => {
            // Executa o comando para excluir o primeiro item
            cy.excluirItem();
        })
        afterEach(() => {
            // Verificar a acessibilidade após cada teste
            cy.pageAccessibility();  // Verifica a acessibilidade de toda a página
          })
    })
    
    describe('Excluir Componente de Produto', () => {
        beforeEach(() => {
            cy.login(usuario, senha); // Login antes de cada teste
        });
    
        it('Deve excluir o componente do produto com sucesso', () => {
            // Executa o comando para excluir o componente
            cy.excluirComponente();
        });
    })     

    describe('Cadastrar Produto sem Nome', () => {
        beforeEach(() => {
            cy.login(usuario, senha) // Login antes de cada teste
        })
        afterEach(() => {
            // Verificar a acessibilidade após cada teste
            cy.pageAccessibility()  // Verifica a acessibilidade de toda a página
          });
        it('Deve exibir mensagem de erro quando o nome do produto não for preenchido', () => {
            // Chama a função de cadastro de produto, mas sem nome
            cy.cadastrarProduto("", "3000")   
    // Mensagem customizada de erro
    throw new Error("ERRO: PRODUTO CADASTRADO")
  })        
        })
    
    
    
    
    
    
    
    



