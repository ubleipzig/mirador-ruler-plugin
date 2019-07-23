context('Ruler Component', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4615');
  });

  it('a button to show the ruler is displayed', () => {
    cy.get('button[title="ruler"]').should('have.length', 1);
  });

  it('click on the ruler button shows/hides the ruler', () => {
    cy.get('.plugin-ruler').should('have.length', 0);
    cy.get('button[title="ruler"]').click();
    cy.get('.plugin-ruler').should('have.length', 1);
    cy.get('.plugin-ruler').should('have.css', 'visibility').and('match', /visible/);
    cy.get('button[title="ruler"]').click();
    cy.get('.plugin-ruler').should('have.css', 'visibility').and('match', /hidden/);
    cy.get('button[title="ruler"]').click();
    cy.get('.plugin-ruler').should('have.css', 'visibility').and('match', /visible/);
  });
});
