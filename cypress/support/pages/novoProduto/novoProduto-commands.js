Cypress.Commands.add("cadastrarProduto", (produtoNome, produtoValor, produtoCor) => {
    // Visitar a página de cadastro de produto
    cy.visit("http://165.227.93.41/lojinha-web/v2/produto/novo");

    // Preencher o nome do produto, se fornecido
    if (produtoNome) {
        cy.get('#produtonome').should('be.visible').type(produtoNome);
    } else {
        cy.get('#produtonome').should('be.visible').clear(); // Deixar o campo vazio
    }

    // Preencher o valor do produto, se fornecido
    if (produtoValor) {
        cy.get('#produtovalor').should('be.visible').type(produtoValor);
    }

    // Preencher a cor do produto, se fornecido
    if (produtoCor) {
        cy.get('#produtocores').should('be.visible').type(produtoCor);
    }

    // Clicar no botão de salvar
    cy.get('#btn-salvar').should('be.visible').click();

    // Verificar o resultado com base no valor e nome do produto
    if (!produtoNome) {
        // Nome do produto obrigatório
        cy.get('.toast').should('be.visible').and('contain.text', 'O campo Nome do produto é obrigatório');
    } else if (!produtoValor || parseFloat(produtoValor.replace('.', '').replace(',', '.')) > 7000 || produtoValor === '0') {
        // Valor inválido
        cy.get('.toast').should('be.visible').and('contain.text', 'O valor do produto deve estar entre R$ 0,01 e R$ 7.000,00');
        cy.url().should('include', 'produto?error=O%20valor%20do%20produto%20deve%20estar%20entre%20R$%200,01%20e%20R$%207.000,00');
    } else {
        // Sucesso
        cy.url().should('include', '/produto/editar');
        cy.get('.toast').should('be.visible').and('contain.text', 'Produto adicionado com sucesso');
    }
});
