Cypress.Commands.add('listaProduto', () => {
    // Visita a página de edição do produto
    cy.visit("http://165.227.93.41/lojinha-web/v2/produto/editar/987723")
    
    // Certifica-se de que a URL está correta antes de prosseguir
    cy.url().should('eq', 'http://165.227.93.41/lojinha-web/v2/produto/editar/987723')
    
    // Clica no botão de listar produtos
    cy.get('.waves-effect.waves-light.btn.grey') // Note o ponto antes do seletor
  .eq(0) // Seleciona o primeiro elemento com essa classe
  .should('be.visible') // Verifica se está visível
  .click() // Clica no elemento

    
    // Certifica-se de que a URL mudou para a página de listagem de produtos
    cy.url().should('eq', 'http://165.227.93.41/lojinha-web/v2/produto')
  })
