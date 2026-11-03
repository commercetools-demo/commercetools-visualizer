// Takes the screenshots used by the README. Needs real data in each feature area and the dev
// server running (`npm start`). It only navigates the UI, it never changes data.
// The `after:screenshot` hook in cypress.config.ts moves each one into docs/<name>.png,
// which the top-level README references.
import { applicationBaseRoute, entryPointUriPath } from '../support/constants';

// Wait for the app to settle before capturing (spinners, slide-over transitions).
const settle = (ms = 800) => {
  cy.get('[role="progressbar"]', { timeout: 15000 }).should('not.exist');
  cy.wait(ms);
};

// `ready` asserts that the page's real content (not just the shell) has rendered.
const shot = (name: string, ready: () => void, ms?: number) => {
  ready();
  settle(ms);
  cy.screenshot(name, { capture: 'fullPage', overwrite: true });
};

// The DataTable header row also matches [role="row"]: index 0 is the header.
const hasRows = () =>
  cy.get('[role="row"]', { timeout: 15000 }).should('have.length.gte', 2);
const hasSaveButton = () =>
  cy
    .findByRole('button', { name: /^(save|create)$/i, timeout: 15000 })
    .should('exist');
const hasFlowNodes = () =>
  cy.get('.react-flow__node', { timeout: 15000 }).should('exist');

const clickFirstDataRow = () =>
  cy.get('[role="row"]', { timeout: 10000 }).eq(1).click();

const clickButton = (name: RegExp) =>
  cy.findAllByRole('button', { name }).first().click();

describe('Screenshots', () => {
  beforeEach(() => {
    cy.loginToMerchantCenter({
      entryPointUriPath,
      initialRoute: applicationBaseRoute,
    });
  });

  it('Homescreen', () => {
    shot('Homescreen', () =>
      cy.findByText(/visualizer for all/i, { timeout: 15000 }).should('exist')
    );
  });

  it('Extensions', () => {
    cy.visit(`${applicationBaseRoute}/extensions`);
    // The target project may have no extensions; the heading is enough.
    shot('Extensions-List', () =>
      cy.findByText(/extensions list/i, { timeout: 15000 }).should('exist')
    );
    clickButton(/add new extension/i);
    shot('Extensions-New', hasSaveButton);
  });

  it('States', () => {
    cy.visit(`${applicationBaseRoute}/states`);
    shot('States-List', hasFlowNodes);
    // react-flow diagram, not a table: click a node, not a row
    cy.get('.react-flow__node', { timeout: 10000 }).first().click();
    shot('States-Details', hasSaveButton);
    cy.visit(`${applicationBaseRoute}/states`);
    clickButton(/add new state/i);
    shot('States-New', hasSaveButton);
  });

  it('Subscriptions', () => {
    cy.visit(`${applicationBaseRoute}/subscriptions`);
    shot('Subscriptions-List', hasRows);
    clickFirstDataRow();
    shot('Subscriptions-Details', hasSaveButton);
    cy.visit(`${applicationBaseRoute}/subscription/new`);
    shot('Subscriptions-New', hasSaveButton);
  });

  it('Types', () => {
    cy.visit(`${applicationBaseRoute}/types`);
    shot('Types-List', hasRows);
    clickFirstDataRow();
    shot('Types-Details', hasSaveButton, 2500); // slide-over transition
    cy.visit(`${applicationBaseRoute}/types`);
    clickButton(/add new type/i);
    shot('Types-New', hasSaveButton);
  });

  it('Custom Objects', () => {
    cy.visit(`${applicationBaseRoute}/custom-objects`);
    // The list needs a real container name typed into the search box.
    cy.findByPlaceholderText(/container name/i).type(
      Cypress.env('CUSTOM_OBJECTS_CONTAINER')
    );
    cy.wait(1500); // debounce in the component
    shot('Custom-Objects-List', hasRows);
    clickFirstDataRow();
    shot('Custom-Objects-Edit', hasSaveButton, 1000);
  });
});
