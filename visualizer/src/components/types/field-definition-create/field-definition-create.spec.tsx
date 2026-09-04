import { setupServer } from 'msw/node';
import { Route } from 'react-router-dom';
import {
  screen,
  mapResourceAccessToAppliedPermissions,
  renderAppWithRedux,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { NimbusProvider } from '@commercetools/nimbus';
import { cleanup } from '@testing-library/react';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import FieldDefinitionCreate from './field-definition-create';

const mockServer = setupServer();
afterEach(async () => {
  mockServer.resetHandlers();
  await cleanup();
});
beforeAll(() => {
  mockServer.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  mockServer.close();
});

const TEST_TYPE_ID = 'b8a40b99-0c11-43bc-8680-fc570d624747';

// `FieldDefinitionCreate` does not fetch on mount (it submits an
// `addFieldDefinition` action), so it can be rendered in isolation, wrapped in
// a `Route` that provides the `:id`/`:version` params. `NimbusProvider` is
// normally supplied once by `EntryPoint`, which isn't rendered here, so it's
// added explicitly.
const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route =
    options.route ||
    `/my-project/${entryPointUriPath}/types/${TEST_TYPE_ID}/1/new`;
  return renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/types/:id/:version/new`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <FieldDefinitionCreate onClose={jest.fn()} />
      </NimbusProvider>
    </Route>,
    {
      route,
      environment: { entryPointUriPath },
      apolloClient: createApolloClient(),
      project: {
        allAppliedPermissions: mapResourceAccessToAppliedPermissions([
          PERMISSIONS.View,
          PERMISSIONS.Manage,
        ]),
      },
      ...options,
    }
  );
};

it('should render the field-definition create form', async () => {
  renderApp();

  // Name + Label + Type fields render (Name is editable in create mode).
  const nameInput = await screen.findByLabelText(/field name/i);
  expect(nameInput).toBeInTheDocument();
  expect(nameInput.hasAttribute('readonly')).toBeFalsy();

  expect(
    screen.getByRole('button', { name: /create field definition/i })
  ).toBeInTheDocument();

  // The submit button is disabled until the form is dirty.
  expect(
    screen.getByRole('button', { name: /create field definition/i })
  ).toBeDisabled();
});
