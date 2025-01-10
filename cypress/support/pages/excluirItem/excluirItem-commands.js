Cypress.Commands.add("excluirItem", () => {
    // Visita a página onde os produtos estão listados
    cy.visit("http://165.227.93.41/lojinha-web/v2/produto");

    // Verifica se a página foi carregada corretamente
    cy.url().should("eq", "http://165.227.93.41/lojinha-web/v2/produto");
    cy.wait(1000)
    // Aguarda até que os ícones de lixeira estejam visíveis
    cy.get('.material-icons')  // Aguarda até que os ícones estejam visíveis
        .eq(1)  // Seleciona o segundo ícone de lixeira
        .should('be.visible')  // Verifica se o ícone está visível
        .click();  // Clica no ícone para excluir o produto

    // Verifica que a URL foi redirecionada (o produto foi removido)
    cy.url().should('include', '?message=Produto%20removido%20com%20sucesso');

    // Verifica se a notificação de sucesso está visível
    cy.get('.toast', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'Produto removido com sucesso');
});
