import { graphql } from 'msw';
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
import StatesList from './states-list';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';

jest.setTimeout(20000);

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

const aState = (id: string, type: string, builtIn = false) => ({
  __typename: 'State',
  id,
  key: `key-${id}`,
  type,
  initial: true,
  builtIn,
  roles: [],
  transitions: null,
  nameAllLocales: [{ __typename: 'LocalizedString', locale: 'en', value: id }],
  descriptionAllLocales: [],
});

const renderApp = (route: string) =>
  renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/states/:type?`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <StatesList linkToWelcome={`/my-project/${entryPointUriPath}`} />
      </NimbusProvider>
    </Route>,
    {
      route,
      environment: { entryPointUriPath },
      apolloClient: createApolloClient(),
      project: {
        allAppliedPermissions: mapResourceAccessToAppliedPermissions([
          PERMISSIONS.View,
        ]),
      },
    } as Partial<TRenderAppWithReduxOptions>
  );

const respondWith = (results: Array<ReturnType<typeof aState>>) =>
  mockServer.use(
    graphql.query('FetchStates', (_req, res, ctx) =>
      res(
        ctx.data({
          states: {
            __typename: 'StateQueryResult',
            total: results.length,
            count: results.length,
            offset: 0,
            results,
          },
        })
      )
    )
  );

describe('state type tabs', () => {
  it('shows a tab, with the count, for each type that has states — including Recurring Order State', async () => {
    respondWith([
      aState('line-1', 'LineItemState', true),
      aState('order-1', 'OrderState'),
      aState('order-2', 'OrderState'),
      aState('recurring-1', 'RecurringOrderState'),
    ]);
    renderApp(`/my-project/${entryPointUriPath}/states/lineitemstate`);

    expect(await screen.findByText('Line Item State (1)')).toBeInTheDocument();
    expect(screen.getByText('Order State list (2)')).toBeInTheDocument();
    expect(screen.getByText('Recurring Order State (1)')).toBeInTheDocument();
  });

  it('shows no tab for a type without states', async () => {
    respondWith([aState('line-1', 'LineItemState', true)]);
    renderApp(`/my-project/${entryPointUriPath}/states/lineitemstate`);

    await screen.findByText('Line Item State (1)');
    expect(
      screen.queryByText(/recurring order state/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/payment state/i)).not.toBeInTheDocument();
  });
});
