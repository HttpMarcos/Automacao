Cypress.Commands.add("excluirComponente", () => {
    // Visita a página de edição do produto
    cy.visit("http://165.227.93.41/lojinha-web/v2/produto/editar/987725");

    // Verifica se a URL está correta após o carregamento da página
    cy.url().should("eq", "http://165.227.93.41/lojinha-web/v2/produto/editar/987725");

    // Aguarda até que os ícones de lixeira estejam visíveis e seleciona o segundo ícone
    cy.get('.material-icons')  // Espera até que os ícones estejam visíveis
        .eq(1)  // Seleciona o segundo ícone de lixeira
        .should('be.visible')  // Verifica se o ícone está visível
        .click();  // Clica no ícone para excluir o produto

    // Verifica que a URL foi redirecionada corretamente após a exclusão (verificando apenas a parte comum da URL)
    cy.url().should('include', '/produto/editar/');

    // Verifica se a notificação de sucesso foi exibida
    cy.get('.toast')
        .and('contain.text', 'Componente de produto removido com sucesso')
})
