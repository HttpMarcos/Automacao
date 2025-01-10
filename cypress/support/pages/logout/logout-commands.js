Cypress.Commands.add('logout', () => {
    // Certifica-se de que está na página de onde o logout pode ser realizado
    cy.visit("http://165.227.93.41/lojinha-web/v2/produto");

    // Certifica-se de que a URL está correta antes de prosseguir
    cy.url().should('eq', 'http://165.227.93.41/lojinha-web/v2/produto');

    // Clica no botão/link de logout
    cy.get('a[href="http://165.227.93.41/lojinha-web/v2/login/sair"]')
        .should('be.visible') // Verifica se o botão de logout está visível
        .click(); // Clica para sair

    // Certifica-se de que foi redirecionado para a tela de login
    cy.url().should('include', '/login');
});
