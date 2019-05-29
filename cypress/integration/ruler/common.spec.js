/// <reference types="Cypress" />

context('Ruler Component', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001');
  });

  it('a button to show the ruler is displayed', () => {
    cy.get('button[aria-label="ruler"]').should('have.length', 1);
  });

  it('click on the ruler button shows/hides the ruler', () => {
    cy.get('.plugin-ruler').should('have.length', 0);
    cy.get('button[aria-label="ruler"]').click();
    cy.get('.plugin-ruler').should('have.length', 1);
    cy.get('.plugin-ruler').should('be.visible');
    cy.get('button[aria-label="ruler"]').click();
    cy.get('.plugin-ruler').should('not.be.visible');
  });
});
