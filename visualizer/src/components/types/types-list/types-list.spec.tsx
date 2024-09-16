import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import {
  fireEvent,
  screen,
  mapResourceAccessToAppliedPermissions,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { buildGraphqlList } from '@commercetools-test-data/core';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import { renderApplicationWithRedux } from '../../../test-utils';
import ApplicationRoutes from '../../../routes';
import { cleanup } from '@testing-library/react-hooks';
import { TType, Type } from '@commercetools-test-data/type';

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

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route = options.route || `/my-project/${entryPointUriPath}/types`;
  const { history } = renderApplicationWithRedux(<ApplicationRoutes />, {
    route,
    project: {
      allAppliedPermissions: mapResourceAccessToAppliedPermissions([
        PERMISSIONS.View,
      ]),
    },
    ...options,
  });
  return { history };
};

it('should render types and paginate to second page', async () => {
  mockServer.use(
    graphql.query('FetchTypes', (req, res, ctx) => {
      // Simulate a server side pagination.
      const { offset } = req.variables;
      const totalItems = 25; // 2 pages
      const itemsPerPage = offset === 0 ? 20 : 5;

      return res(
        ctx.data({
          typeDefinitions: buildGraphqlList<TType>(
            Array.from({ length: itemsPerPage }).map((_, index) => {
              return Type.random().key(
                `type-key-${offset === 0 ? index : 20 + index}`
              );
            }),
            {
              name: 'typeDefinitions',
              total: totalItems,
            }
          ),
        })
      );
    })
  );
  renderApp();

  // First page
  await screen.findByText('type-key-0');
  expect(screen.queryByText('type-key-22')).not.toBeInTheDocument();

  // Go to second page
  fireEvent.click(screen.getByLabelText('Next page'));

  // Second page
  await screen.findByText('type-key-22');
  expect(screen.queryByText('type-key-0')).not.toBeInTheDocument();
});
