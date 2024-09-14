const collapsibleElement = '#operations-Users_API-UsersController_getUsers';

const getInput = (name: string) =>
  `${collapsibleElement} tr[data-param-name="${name}"] input`;

describe(`Get Users Swagger API E2E Test`, () => {
  it(`GET /users?firstName=John&limit=20&page=1&sort=-1&sortBy=createdAt)`, () => {
    cy.visit(
      `http://localhost:9000/swagger#/Users%20API/UsersController_getUsers`,
    );

    cy.get(`${collapsibleElement} .try-out__btn`).click();

    cy.get(getInput('birthDate')).clear();

    cy.get(getInput('email')).clear();

    cy.get(getInput('firstName')).should('contain.value', 'John');

    cy.get(getInput('lastName')).clear();

    cy.get(getInput('status')).clear();

    cy.get(`${collapsibleElement} button.execute.opblock-control__btn`).click();

    cy.get(`${collapsibleElement} .highlight-code`)
      .should('be.visible')
      .and('contain.text', 'data');

    cy.get(`${collapsibleElement} .microlight`).should('be.visible');
  });
});
