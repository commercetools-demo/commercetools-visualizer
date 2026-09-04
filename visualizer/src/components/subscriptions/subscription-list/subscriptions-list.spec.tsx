import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import { Route } from 'react-router-dom';
import {
  fireEvent,
  screen,
  mapResourceAccessToAppliedPermissions,
  renderAppWithRedux,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { buildGraphqlList } from '@commercetools-test-data/core';
import { NimbusProvider } from '@commercetools/nimbus';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import SubscriptionList from './subscription-list';
import {
  random,
  TSubscription,
} from '../../../test-utils/models/subscriptions';
import { cleanup } from '@testing-library/react';

const mockServer = setupServer();
afterEach(async () => {
  mockServer.resetHandlers();
  await cleanup();
});

beforeAll(() => {
  mockServer.listen({
    // for debugging reasons we force an error when the test fires a request with a query or mutation which is not mocked
    // more: https://mswjs.io/docs/api/setup-worker/start#onunhandledrequest
    onUnhandledRequest: 'error',
  });
});
afterAll(() => {
  mockServer.close();
});

// `SubscriptionList` is rendered in isolation (rather than via
// `<ApplicationRoutes />`) so the test does not transitively import unrelated
// routes (e.g. Custom Objects' JSON editor, which Jest cannot parse). It is
// wrapped in a `Route` mirroring the real nesting. `NimbusProvider` is
// normally supplied once by `EntryPoint`, which isn't rendered here, so it's
// added explicitly.
const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route =
    options.route || `/my-project/${entryPointUriPath}/subscriptions`;
  const { history } = renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/subscriptions`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <SubscriptionList linkToHome={`/my-project/${entryPointUriPath}`} />
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
      ...options,
    }
  );
  return { history };
};

it('should render subscriptions and paginate to second page', async () => {
  mockServer.use(
    graphql.query('FetchSubscriptions', (req, res, ctx) => {
      // Simulate a server side pagination.
      const { offset } = req.variables;
      const totalItems = 25; // 2 pages
      const itemsPerPage = offset === 0 ? 20 : 5;

      return res(
        ctx.data({
          subscriptions: buildGraphqlList<TSubscription>(
            Array.from({ length: itemsPerPage }).map((_, index) => {
              return random().key(
                `subscription-key-${offset === 0 ? index : 20 + index}`
              );
            }),
            {
              name: 'Subscriptions',
              total: totalItems,
            }
          ),
        })
      );
    })
  );
  renderApp();

  // First page
  await screen.findByText('subscription-key-0');
  expect(screen.queryByText('subscription-key-22')).not.toBeInTheDocument();

  // Go to second page
  fireEvent.click(screen.getByLabelText('Go to next page'));

  // Second page
  await screen.findByText('subscription-key-22');
  expect(screen.queryByText('subscription-key-0')).not.toBeInTheDocument();
});
