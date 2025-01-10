Cypress.Commands.add('adicionarComponente', (componenteNome, quantidadeComponente) => {
    // Visita a página inicial
    cy.visit("http://165.227.93.41/lojinha-web/v2/produto/editar/987719");
    
    // Certifica-se de que a URL está correta antes de prosseguir
    cy.url().should('eq', 'http://165.227.93.41/lojinha-web/v2/produto/editar/987719');
    
    // Aguarda que o botão "Adicionar componente" esteja visível e clica
    cy.contains('Adicionar componente')
        .scrollIntoView()
        .should('be.visible')
        .click();
    
    // Certifique-se de que os campos de entrada estão visíveis e digite os valores
    cy.get('#componentenomeadicionar')
        .should('be.visible')
        .type(componenteNome, { force: true });
    cy.get('#componentequantidadeadicionar')
        .should('be.visible')
        .type(quantidadeComponente, { force: true });
    
    // Clica no botão para salvar o componente
    cy.get('.waves-effect.waves-light.btn').eq(3)
        .should('be.visible')
        .click();
    
    // Verifica se a notificação de sucesso está visível
    cy.get('.toast')
        .should('be.visible')
        .and('contain.text', 'Componente de produto adicionado com sucesso');
});
