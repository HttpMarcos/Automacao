Cypress.Commands.add("cadastrarProduto", (produtoNome, produtoValor, produtoCor) => {
    // Visitar a página de cadastro de produto
    cy.visit("http://165.227.93.41/lojinha-web/v2/produto/novo")

    // Continuar com a verificação e cadastro do produto
    cy.get('#produtonome').should('be.visible')

    // Preencher o nome do produto, se fornecido
    if (produtoNome) {
        cy.get('#produtonome').type(produtoNome)
    } else {
        cy.get('#produtonome').clear();  // Deixar campo vazio, caso não tenha nome
    }

    // Preencher o valor do produto, se fornecido
    if (produtoValor) {
        cy.get('#produtovalor').type(produtoValor)
    }

    // Preencher a cor do produto, se fornecido
    if (produtoCor) {
        cy.get('#produtocores').type(produtoCor)
    }

    // Clicar no botão de salvar
    cy.get('#btn-salvar').click()

    // Verificar o resultado com base no nome do produto
    if (produtoNome) {
        // Se o nome foi preenchido, esperar o redirecionamento para a edição do produto
        cy.url(),('include', '/produto/editar')
        cy.get('.toast').should('be.visible').and('contain.text', 'Produto adicionado com sucesso')
    } else {
        // Se o nome não foi fornecido, verificar o erro de validação do campo nome
        cy.get('.toast').should('be.visible').and('contain.text', 'O campo Nome do produto é obrigatório')
    }

    // Caso o valor do produto seja inválido (maior que o limite), verificar a URL com o parâmetro de erro
    if (produtoValor > 7000) {
        cy.url().should('eq', 'http://165.227.93.41/lojinha-web/v2/produto?error=O%20valor%20do%20produto%20deve%20estar%20entre%20R$%200,01%20e%20R$%207.000,00')
    }
})
