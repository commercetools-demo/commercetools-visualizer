import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import { Route } from 'react-router-dom';
import {
  fireEvent,
  screen,
  waitFor,
  within,
  mapResourceAccessToAppliedPermissions,
  renderAppWithRedux,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { buildGraphqlList } from '@commercetools-test-data/core';
import { NimbusProvider } from '@commercetools/nimbus';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TType, Type } from '@commercetools-test-data/type';
import {
  buildFieldDefinition,
  buildTypeDefinition,
  simpleFieldType,
} from '../../../test-utils/models/types';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import TypesList from './types-list';

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

// `TypesList` is rendered in isolation (rather than via `<ApplicationRoutes />`)
// so the test does not transitively import unrelated routes. It is wrapped in a
// `Route` mirroring the real nesting so `useRouteMatch()` resolves the `/types`
// base — otherwise the `/:id` edit sub-route would spuriously match.
// `NimbusProvider` is normally supplied once by `EntryPoint`, which isn't
// rendered here, so it's added explicitly.
const renderApp = (
  options: Partial<TRenderAppWithReduxOptions> = {},
  permissions: string[] = [PERMISSIONS.View]
) => {
  const route = options.route || `/my-project/${entryPointUriPath}/types`;
  const { history } = renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/types`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <TypesList />
      </NimbusProvider>
    </Route>,
    {
      route,
      environment: { entryPointUriPath },
      apolloClient: createApolloClient(),
      project: {
        allAppliedPermissions:
          mapResourceAccessToAppliedPermissions(permissions),
      },
      ...options,
    }
  );
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

  // Go to second page (Nimbus Pagination labels its controls "Go to next page")
  fireEvent.click(screen.getByLabelText('Go to next page'));

  // Second page
  await screen.findByText('type-key-22');
  expect(screen.queryByText('type-key-0')).not.toBeInTheDocument();
});

const listOf = (types: Array<ReturnType<typeof buildTypeDefinition>>) =>
  graphql.query('FetchTypes', (_req, res, ctx) =>
    res(
      ctx.data({
        typeDefinitions: {
          __typename: 'TypeDefinitionQueryResult',
          total: types.length,
          count: types.length,
          offset: 0,
          results: types,
        },
      })
    )
  );

describe('rendering rows', () => {
  const types = [
    buildTypeDefinition({
      id: 'type-a',
      key: 'alpha-type',
      name: 'Alpha name',
      description: 'Alpha description',
      resourceTypeIds: ['customer', 'order'],
      fieldDefinitions: [
        buildFieldDefinition('f1', simpleFieldType('String')),
        buildFieldDefinition('f2', simpleFieldType('Number')),
        buildFieldDefinition('f3', simpleFieldType('Boolean')),
      ],
    }),
    buildTypeDefinition({
      id: 'type-b',
      key: 'beta-type',
      name: 'Beta name',
      resourceTypeIds: ['category'],
      fieldDefinitions: [],
    }),
  ];

  it('renders the title and a column header per column', async () => {
    mockServer.use(listOf(types));
    renderApp();

    await screen.findByText('alpha-type');
    expect(screen.getByText('Types list')).toBeInTheDocument();
    [
      'Name',
      'Description',
      'Key',
      'Resource Types',
      'Fields',
      'Created on',
      'Modified on',
    ].forEach((header) =>
      expect(
        screen.getByRole('columnheader', { name: new RegExp(header, 'i') })
      ).toBeInTheDocument()
    );
  });

  it('renders key, name, description, joined resource types and field count', async () => {
    mockServer.use(listOf(types));
    renderApp();

    // eslint-disable-next-line testing-library/no-node-access
    const row = (await screen.findByText('alpha-type')).closest(
      'tr'
    ) as HTMLElement;
    expect(within(row).getByText('Alpha name')).toBeInTheDocument();
    expect(within(row).getByText('Alpha description')).toBeInTheDocument();
    expect(within(row).getByText('customer, order')).toBeInTheDocument();
    expect(within(row).getByText('3')).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-node-access
    const otherRow = screen.getByText('beta-type').closest('tr') as HTMLElement;
    expect(within(otherRow).getByText('category')).toBeInTheDocument();
    expect(within(otherRow).getByText('0')).toBeInTheDocument();
  });

  it('shows the empty state when there are no types', async () => {
    mockServer.use(listOf([]));
    renderApp();

    await screen.findByText(/there are no types available in this project/i);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('shows an error alert when fetching fails', async () => {
    mockServer.use(
      graphql.query('FetchTypes', (_req, res, ctx) =>
        res(ctx.errors([{ message: 'Fetch exploded' }]))
      )
    );
    renderApp();

    await screen.findByText(/fetch exploded/i);
    expect(screen.queryByText('alpha-type')).not.toBeInTheDocument();
  });
});

describe('requests', () => {
  it('fetches the first page, 20 per page, sorted by key ascending by default', async () => {
    const seen: Array<Record<string, unknown>> = [];
    mockServer.use(
      graphql.query('FetchTypes', (req, res, ctx) => {
        seen.push(req.variables);
        return res(
          ctx.data({
            typeDefinitions: {
              __typename: 'TypeDefinitionQueryResult',
              total: 1,
              count: 1,
              offset: 0,
              results: [buildTypeDefinition({ key: 'only-type' })],
            },
          })
        );
      })
    );
    renderApp();
    await screen.findByText('only-type');

    expect(seen[0]).toMatchObject({
      limit: 20,
      offset: 0,
      sort: ['key asc'],
    });
  });

  it('toggles to descending order when the key column is sorted again', async () => {
    const sorts: unknown[] = [];
    mockServer.use(
      graphql.query('FetchTypes', (req, res, ctx) => {
        sorts.push(req.variables.sort);
        return res(
          ctx.data({
            typeDefinitions: {
              __typename: 'TypeDefinitionQueryResult',
              total: 2,
              count: 2,
              offset: 0,
              results: [
                buildTypeDefinition({ key: 'type-one' }),
                buildTypeDefinition({ key: 'type-two' }),
              ],
            },
          })
        );
      })
    );
    renderApp();
    await screen.findByText('type-one');

    fireEvent.click(screen.getByRole('columnheader', { name: /^key/i }));
    await waitFor(() => expect(sorts).toContainEqual(['key desc']));
  });

  it('sorts by another column ascending when its header is clicked', async () => {
    const sorts: unknown[] = [];
    mockServer.use(
      graphql.query('FetchTypes', (req, res, ctx) => {
        sorts.push(req.variables.sort);
        return res(
          ctx.data({
            typeDefinitions: {
              __typename: 'TypeDefinitionQueryResult',
              total: 1,
              count: 1,
              offset: 0,
              results: [buildTypeDefinition({ key: 'type-one' })],
            },
          })
        );
      })
    );
    renderApp();
    await screen.findByText('type-one');

    fireEvent.click(screen.getByRole('columnheader', { name: /^name/i }));
    await waitFor(() => expect(sorts).toContainEqual(['name asc']));
  });
});

describe('navigation', () => {
  const oneType = buildTypeDefinition({ id: 'type-123', key: 'click-me' });

  it('navigates to the edit route when a row is clicked', async () => {
    mockServer.use(
      listOf([oneType]),
      graphql.query('FetchType', (_req, res, ctx) =>
        res(ctx.data({ typeDefinition: oneType }))
      )
    );
    const { history } = renderApp();

    await userEvent.click(await screen.findByText('click-me'));

    await waitFor(() =>
      expect(history.location.pathname).toBe(
        `/my-project/${entryPointUriPath}/types/type-123`
      )
    );
  });

  it('navigates to the create route when "Add New Type" is pressed', async () => {
    mockServer.use(listOf([oneType]));
    const { history } = renderApp({}, [PERMISSIONS.View, PERMISSIONS.Manage]);

    await screen.findByText('click-me');
    fireEvent.click(screen.getByRole('button', { name: /add new type/i }));

    await waitFor(() =>
      expect(history.location.pathname).toBe(
        `/my-project/${entryPointUriPath}/types/new`
      )
    );
    await screen.findByRole('heading', { name: /create a type/i });
  });
});

describe('permissions', () => {
  it('enables "Add New Type" with manage permission', async () => {
    mockServer.use(listOf([buildTypeDefinition({ key: 'some-type' })]));
    renderApp({}, [PERMISSIONS.View, PERMISSIONS.Manage]);

    await screen.findByText('some-type');
    expect(screen.getByRole('button', { name: /add new type/i })).toBeEnabled();
  });

  it('shows but disables "Add New Type" without manage permission', async () => {
    mockServer.use(listOf([buildTypeDefinition({ key: 'some-type' })]));
    renderApp();

    await screen.findByText('some-type');
    expect(
      screen.getByRole('button', { name: /add new type/i })
    ).toBeDisabled();
  });
});
