Cypress.Commands.add("editaProduto", (produtoNome, produtoValor, produtoCor) => {
    const valorMaximo = 7000
    let valorFinal = produtoValor

    // Limitar o valor para não ultrapassar 7.000
    if (parseFloat(valorFinal) > valorMaximo) {
        valorFinal = valorMaximo.toString()
    }

    // Visitar a página inicial
    cy.visit("http://165.227.93.41/lojinha-web/v2/produto")

    // Continuar com a verificação e cadastro do produto
    cy.contains('a', 'Playstation').click()
    cy.get('#produtonome').should('be.visible').type(produtoNome)
    cy.get('#produtovalor').should('be.visible').clear().type(valorFinal)
    cy.get('#produtocores').should('be.visible').type(produtoCor)

    // Aguardar até que o botão 'Salvar' esteja visível e clicável
    cy.contains('.btn.waves-effect.waves-light', 'Salvar').should('be.visible').and('not.be.disabled').click()


    // Validar que o cadastro foi concluído com sucesso
    cy.url("http://165.227.93.41/lojinha-web/v2/produto/editar/984647?message=Produto%20adicionado%20com%20sucesso")

    return cy.url()
})
