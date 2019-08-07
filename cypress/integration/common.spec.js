context('Ruler Component', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4615');
  });

  it('a button to show the ruler is displayed for each manifest providing a canvas service', () => {
    cy.get('button[title="ruler"]').should('have.length', 2);
  });

  it('click on the ruler button shows/hides the ruler', () => {
    // click on the first ruler button
    cy.get('button[title="ruler"]').first().click();
    
    // the ruler of the corresponding window should be visibible
    cy.get('button[title="ruler"]').first().parent().parent().find('.plugin-ruler').should('have.length', 1);
    cy.get('button[title="ruler"]').first().parent().parent().find('.plugin-ruler').should('have.css', 'visibility').and('match', /visible/);

    // the ruler of the other window should not be visible
    cy.get('button[title="ruler"]').last().parent().parent().find('.plugin-ruler').should('have.length', 1);
    cy.get('button[title="ruler"]').last().parent().parent().find('.plugin-ruler').should('have.css', 'visibility').and('match', /hidden/);
  });
});
