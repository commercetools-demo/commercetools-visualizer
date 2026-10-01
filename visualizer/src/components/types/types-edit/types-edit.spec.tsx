import { graphql, type GraphQLHandler } from 'msw';
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
import { NimbusProvider } from '@commercetools/nimbus';
import { cleanup } from '@testing-library/react';
import { Type } from '@commercetools-test-data/type';
import { TTypeGraphql } from '@commercetools-test-data/type/dist/declarations/src/type/types';
import { LocalizedString } from '@commercetools-test-data/commons';
import {
  buildFieldDefinition,
  buildTypeDefinition,
  simpleFieldType,
} from '../../../test-utils/models/types';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import TypesEdit from './types-edit';

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

const TEST_TYPE_ID = 'b8a40b99-0c11-43bc-8680-fc570d624747';
const TEST_TYPE_KEY = 'test-key';
const TEST_TYPE_NAME = 'test-name';
const TEST_TYPE_NEW_NAME = 'new-test-name';

const type = Type.random()
  .key(TEST_TYPE_KEY)
  // @ts-ignore
  .name(LocalizedString.random().en(TEST_TYPE_NAME))
  .buildGraphql<TTypeGraphql>();

// `TypesEdit` is rendered in isolation (rather than via `<ApplicationRoutes />`)
// so the test does not transitively import unrelated routes. It is wrapped in a
// `Route` that provides the `:id` param. `NimbusProvider` is normally supplied
// once by `EntryPoint`, which isn't rendered here, so it's added explicitly.
const renderApp = (
  options: Partial<TRenderAppWithReduxOptions> = {},
  includeManagePermissions = true,
  onClose: () => void = jest.fn()
) => {
  const route =
    options.route || `/my-project/${entryPointUriPath}/types/${TEST_TYPE_ID}`;
  const { history } = renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/types/:id`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <TypesEdit
          linkToHome={`/my-project/${entryPointUriPath}/types`}
          onClose={onClose}
        />
      </NimbusProvider>
    </Route>,
    {
      route,
      environment: { entryPointUriPath },
      apolloClient: createApolloClient(),
      project: {
        allAppliedPermissions: mapResourceAccessToAppliedPermissions(
          [
            PERMISSIONS.View,
            includeManagePermissions ? PERMISSIONS.Manage : '',
          ].filter(Boolean)
        ),
      },
      ...options,
    }
  );
  return { history };
};

const fetchTypeDetailsQueryHandler = graphql.query(
  'FetchType',
  (_req, res, ctx) => {
    return res(
      ctx.data({
        typeDefinition: type,
      })
    );
  }
);

const fetchTypeDetailsQueryHandlerWithNullData = graphql.query(
  'FetchType',
  (_req, res, ctx) => {
    return res(ctx.data({ typeDefinition: null }));
  }
);

const updateTypeDetailsHandler = graphql.mutation(
  'UpdateType',
  (_req, res, ctx) => {
    return res(
      ctx.data({
        updateType: Type.random().key(TEST_TYPE_KEY).buildGraphql(),
      })
    );
  }
);

const useMockServerHandlers = (handlers: GraphQLHandler[]) => {
  mockServer.use(...handlers);
};

describe('rendering', () => {
  it('should render type details', async () => {
    useMockServerHandlers([fetchTypeDetailsQueryHandler]);
    renderApp();

    const keyInput: HTMLInputElement = await screen.findByLabelText(/key */i);
    expect(keyInput.value).toBe(TEST_TYPE_KEY);
    expect(keyInput.hasAttribute('readonly')).toBeTruthy();

    const resourceTypeId = await screen.findByLabelText(/resource type ids */i);
    expect(resourceTypeId.hasAttribute('readonly')).toBeTruthy();

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should reset form values on "revert" button click', async () => {
    useMockServerHandlers([fetchTypeDetailsQueryHandler]);
    renderApp();

    const resetButton = await screen.findByRole('button', {
      name: /revert/i,
    });
    expect(resetButton).toBeDisabled();

    const name = (await screen.findByDisplayValue(
      TEST_TYPE_NAME
    )) as HTMLInputElement;

    fireEvent.change(name, {
      target: { value: TEST_TYPE_NEW_NAME },
    });
    expect(name.value).toBe(TEST_TYPE_NEW_NAME);

    await waitFor(() => {
      expect(resetButton).toBeEnabled();
    });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(name.value).toBe(TEST_TYPE_NAME);
    });
  }, 10000);

  describe('when user has no manage permission', () => {
    it('should render the form as read-only and keep the "save" button "disabled"', async () => {
      useMockServerHandlers([
        fetchTypeDetailsQueryHandler,
        updateTypeDetailsHandler,
      ]);
      renderApp({}, false);

      const keyInput = await screen.findByLabelText(/key */i);
      expect(keyInput.hasAttribute('readonly')).toBeTruthy();

      const resourceTypeId = await screen.findByLabelText(
        /resource type ids */i
      );
      expect(resourceTypeId.hasAttribute('readonly')).toBeTruthy();

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    }, 10000);
  });

  it('should display a "page not found" information if the fetched type details data is null (without an error)', async () => {
    useMockServerHandlers([fetchTypeDetailsQueryHandlerWithNullData]);
    renderApp();

    await screen.findByRole('heading', {
      name: /we could not find what you are looking for/i,
    });
  });
});

// --- Saving, deleting and staged field removal -----------------------------

const TYPE_VERSION = 4;
const buildEditableType = () =>
  buildTypeDefinition({
    id: TEST_TYPE_ID,
    key: TEST_TYPE_KEY,
    name: TEST_TYPE_NAME,
    description: 'test-description',
    version: TYPE_VERSION,
    resourceTypeIds: ['customer'],
    fieldDefinitions: [
      buildFieldDefinition('first-field', simpleFieldType('String'), {
        label: 'First label',
      }),
      buildFieldDefinition('second-field', simpleFieldType('Number'), {
        label: 'Second label',
      }),
    ],
  });

const typeHandler = (typeDefinition: unknown = buildEditableType()) =>
  graphql.query('FetchType', (_req, res, ctx) =>
    res(ctx.data({ typeDefinition }))
  );

// Captures the variables of the `UpdateTypeDefinition` mutation and answers
// with the type at the next version, as the real API would.
const captureUpdate = (respondWith: () => unknown = buildEditableType) => {
  const calls: Array<{
    id: string;
    version: number;
    actions: Array<Record<string, unknown>>;
  }> = [];
  const handler = graphql.mutation('UpdateTypeDefinition', (req, res, ctx) => {
    calls.push(
      req.variables as {
        id: string;
        version: number;
        actions: Array<Record<string, unknown>>;
      }
    );
    return res(
      ctx.data({
        updateTypeDefinition: {
          ...(respondWith() as object),
          version: TYPE_VERSION + 1,
        },
      })
    );
  });
  return { calls, handler };
};

const fieldRow = async (name: string) =>
  // eslint-disable-next-line testing-library/no-node-access
  (await screen.findByText(name)).closest('[role="row"]') as HTMLElement;

const typeName = async () =>
  (await screen.findByDisplayValue(TEST_TYPE_NAME)) as HTMLInputElement;

describe('saving', () => {
  it('sends a changeName action with the current version and shows a success notification', async () => {
    const { calls, handler } = captureUpdate();
    useMockServerHandlers([typeHandler(), handler]);
    renderApp();

    fireEvent.change(await typeName(), {
      target: { value: TEST_TYPE_NEW_NAME },
    });
    const saveButton = screen.getByRole('button', { name: /save/i });
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].id).toBe(TEST_TYPE_ID);
    expect(calls[0].version).toBe(TYPE_VERSION);
    expect(calls[0].actions).toHaveLength(1);
    expect(calls[0].actions[0]).toHaveProperty('changeName');
    expect(JSON.stringify(calls[0].actions[0])).toContain(TEST_TYPE_NEW_NAME);
    await screen.findByText('Your Type has been updated.');
  });

  it('sends a setDescription action when only the description changed', async () => {
    const { calls, handler } = captureUpdate();
    useMockServerHandlers([typeHandler(), handler]);
    renderApp();

    const description = await screen.findByDisplayValue('test-description');
    fireEvent.change(description, { target: { value: 'new description' } });
    const saveButton = screen.getByRole('button', { name: /save/i });
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].actions).toHaveLength(1);
    expect(calls[0].actions[0]).toHaveProperty('setDescription');
    expect(JSON.stringify(calls[0].actions[0])).toContain('new description');
  });

  it('keeps Save disabled while nothing changed, so no mutation is sent', async () => {
    const { calls, handler } = captureUpdate();
    useMockServerHandlers([typeHandler(), handler]);
    renderApp();

    await typeName();
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);
    expect(calls).toHaveLength(0);
  });

  it('sends no mutation when a change is reverted to the original value', async () => {
    const { calls, handler } = captureUpdate();
    useMockServerHandlers([typeHandler(), handler]);
    renderApp();

    const name = await typeName();
    fireEvent.change(name, { target: { value: TEST_TYPE_NEW_NAME } });
    fireEvent.change(name, { target: { value: TEST_TYPE_NAME } });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    );
    expect(calls).toHaveLength(0);
  });

  it('shows an error notification and no success when the update fails', async () => {
    useMockServerHandlers([
      typeHandler(),
      graphql.mutation('UpdateTypeDefinition', (_req, res, ctx) =>
        res(ctx.errors([{ message: 'Concurrent modification boom' }]))
      ),
    ]);
    renderApp();

    fireEvent.change(await typeName(), {
      target: { value: TEST_TYPE_NEW_NAME },
    });
    const saveButton = screen.getByRole('button', { name: /save/i });
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await screen.findByText(/Concurrent modification boom/);
    expect(
      screen.queryByText('Your Type has been updated.')
    ).not.toBeInTheDocument();
  });
});

describe('deleting', () => {
  it('sends the delete mutation with id and version, then closes', async () => {
    const calls: Array<{ id: string; version: number }> = [];
    const onClose = jest.fn();
    useMockServerHandlers([
      typeHandler(),
      graphql.mutation('DeleteTypeDefintion', (req, res, ctx) => {
        calls.push(
          req.variables as {
            id: string;
            version: number;
            actions: Array<Record<string, unknown>>;
          }
        );
        return res(ctx.data({ deleteTypeDefinition: { id: TEST_TYPE_ID } }));
      }),
    ]);
    renderApp({}, true, onClose);

    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(calls).toEqual([{ id: TEST_TYPE_ID, version: TYPE_VERSION }]);
  });

  it('shows an error and does not close when the delete fails', async () => {
    const onClose = jest.fn();
    useMockServerHandlers([
      typeHandler(),
      graphql.mutation('DeleteTypeDefintion', (_req, res, ctx) =>
        res(ctx.errors([{ message: 'Type is still in use' }]))
      ),
    ]);
    renderApp({}, true, onClose);

    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

    await screen.findByText(/Type is still in use/);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables the delete button without the manage permission', async () => {
    useMockServerHandlers([typeHandler()]);
    renderApp({}, false);

    expect(
      await screen.findByRole('button', { name: /delete/i })
    ).toBeDisabled();
  });
});

describe('fetch errors', () => {
  it('renders an alert with the GraphQL error message', async () => {
    useMockServerHandlers([
      graphql.query('FetchType', (_req, res, ctx) =>
        res(ctx.errors([{ message: 'Type fetch exploded' }]))
      ),
    ]);
    renderApp();

    expect(await screen.findByText(/Type fetch exploded/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /save/i })
    ).not.toBeInTheDocument();
  });
});

describe('field definitions', () => {
  it('lists the fields of the type', async () => {
    useMockServerHandlers([typeHandler()]);
    renderApp();
    expect(await fieldRow('first-field')).toBeInTheDocument();
    expect(await fieldRow('second-field')).toBeInTheDocument();
  });

  it('stages a field removal until Save, then sends removeFieldDefinition', async () => {
    const { calls, handler } = captureUpdate();
    useMockServerHandlers([typeHandler(), handler]);
    renderApp();

    const row = await fieldRow('first-field');
    fireEvent.click(
      within(row).getByRole('button', { name: 'Remove Field Definition' })
    );

    // Staged: gone from the table, but nothing was sent yet.
    await waitFor(() =>
      expect(screen.queryByText('first-field')).not.toBeInTheDocument()
    );
    expect(screen.getByText('second-field')).toBeInTheDocument();
    expect(calls).toHaveLength(0);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].version).toBe(TYPE_VERSION);
    expect(calls[0].actions).toEqual([
      { removeFieldDefinition: { fieldName: 'first-field' } },
    ]);
  });

  it('combines a staged removal with a name change in one update', async () => {
    const { calls, handler } = captureUpdate();
    useMockServerHandlers([typeHandler(), handler]);
    renderApp();

    fireEvent.change(await typeName(), {
      target: { value: TEST_TYPE_NEW_NAME },
    });
    const row = await fieldRow('second-field');
    fireEvent.click(
      within(row).getByRole('button', { name: 'Remove Field Definition' })
    );
    const saveButton = screen.getByRole('button', { name: /save/i });
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(calls).toHaveLength(1));
    const names = calls[0].actions.map((a) => Object.keys(a)[0]);
    expect(names).toEqual(['removeFieldDefinition', 'changeName']);
    expect(calls[0].actions[0]).toEqual({
      removeFieldDefinition: { fieldName: 'second-field' },
    });
  });

  it('Revert restores a staged removal without sending anything', async () => {
    const { calls, handler } = captureUpdate();
    useMockServerHandlers([typeHandler(), handler]);
    renderApp();

    const row = await fieldRow('first-field');
    fireEvent.click(
      within(row).getByRole('button', { name: 'Remove Field Definition' })
    );
    await waitFor(() =>
      expect(screen.queryByText('first-field')).not.toBeInTheDocument()
    );

    const revert = screen.getByRole('button', { name: /revert/i });
    await waitFor(() => expect(revert).toBeEnabled());
    fireEvent.click(revert);

    expect(await fieldRow('first-field')).toBeInTheDocument();
    await waitFor(() => expect(revert).toBeDisabled());
    expect(calls).toHaveLength(0);
  });

  it('disables field removal and adding without the manage permission', async () => {
    useMockServerHandlers([typeHandler()]);
    renderApp({}, false);

    await fieldRow('first-field');
    screen
      .getAllByRole('button', { name: 'Remove Field Definition' })
      .forEach((button) => expect(button).toBeDisabled());
    expect(
      screen.getByRole('button', { name: /add field definition/i })
    ).toBeDisabled();
  });
});

describe('reordering field definitions', () => {
  // three fields, so that moving one has a visible effect on both neighbours
  const threeFields = () =>
    buildTypeDefinition({
      id: TEST_TYPE_ID,
      key: TEST_TYPE_KEY,
      name: TEST_TYPE_NAME,
      description: 'test-description',
      version: TYPE_VERSION,
      resourceTypeIds: ['customer'],
      fieldDefinitions: ['alpha', 'beta', 'gamma'].map((name) =>
        buildFieldDefinition(name, simpleFieldType('String'), {
          label: `${name} label`,
        })
      ),
    });

  // the field names in table order (header rows have no row header cell)
  const fieldOrder = () =>
    screen
      .getAllByRole('row')
      .filter((row) => within(row).queryAllByRole('rowheader').length > 0)
      .map((row) => within(row).getAllByRole('rowheader')[0].textContent);
  const moveUp = async (name: string) =>
    fireEvent.click(
      within(await fieldRow(name)).getByRole('button', {
        name: `Move field ${name} up`,
      })
    );
  const moveDown = async (name: string) =>
    fireEvent.click(
      within(await fieldRow(name)).getByRole('button', {
        name: `Move field ${name} down`,
      })
    );
  const save = async () => {
    const saveButton = screen.getByRole('button', { name: /save/i });
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);
  };

  it('cannot move the first field up or the last field down', async () => {
    useMockServerHandlers([typeHandler(threeFields())]);
    renderApp();

    expect(
      within(await fieldRow('alpha')).getByRole('button', {
        name: 'Move field alpha up',
      })
    ).toBeDisabled();
    expect(
      within(await fieldRow('gamma')).getByRole('button', {
        name: 'Move field gamma down',
      })
    ).toBeDisabled();
    expect(
      within(await fieldRow('beta')).getByRole('button', {
        name: 'Move field beta up',
      })
    ).toBeEnabled();
  });

  it('stages a move until Save, then sends changeFieldDefinitionOrder with all names in the new order', async () => {
    const { calls, handler } = captureUpdate(threeFields);
    useMockServerHandlers([typeHandler(threeFields()), handler]);
    renderApp();

    await moveUp('gamma');

    await waitFor(() =>
      expect(fieldOrder()).toEqual(['alpha', 'gamma', 'beta'])
    );
    expect(calls).toHaveLength(0);
    await save();

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].version).toBe(TYPE_VERSION);
    expect(calls[0].actions).toEqual([
      {
        changeFieldDefinitionOrder: { fieldNames: ['alpha', 'gamma', 'beta'] },
      },
    ]);
  });

  it('moves a field down as well', async () => {
    const { calls, handler } = captureUpdate(threeFields);
    useMockServerHandlers([typeHandler(threeFields()), handler]);
    renderApp();

    await moveDown('alpha');
    await waitFor(() =>
      expect(fieldOrder()).toEqual(['beta', 'alpha', 'gamma'])
    );
    await save();

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].actions).toEqual([
      {
        changeFieldDefinitionOrder: { fieldNames: ['beta', 'alpha', 'gamma'] },
      },
    ]);
  });

  it('sends nothing when a field is moved and moved back', async () => {
    const { calls, handler } = captureUpdate(threeFields);
    useMockServerHandlers([typeHandler(threeFields()), handler]);
    renderApp();

    await moveDown('alpha');
    await waitFor(() =>
      expect(fieldOrder()).toEqual(['beta', 'alpha', 'gamma'])
    );
    await moveUp('alpha');
    await waitFor(() =>
      expect(fieldOrder()).toEqual(['alpha', 'beta', 'gamma'])
    );

    // The form is pristine again, so there is nothing to save.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    );
    expect(calls).toHaveLength(0);
  });

  it('sends the removal first, then the order of the remaining fields', async () => {
    const { calls, handler } = captureUpdate(threeFields);
    useMockServerHandlers([typeHandler(threeFields()), handler]);
    renderApp();

    await moveUp('gamma'); // alpha, gamma, beta
    await waitFor(() =>
      expect(fieldOrder()).toEqual(['alpha', 'gamma', 'beta'])
    );
    fireEvent.click(
      within(await fieldRow('alpha')).getByRole('button', {
        name: 'Remove Field Definition',
      })
    );
    await waitFor(() => expect(fieldOrder()).toEqual(['gamma', 'beta']));
    await save();

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].actions).toEqual([
      { removeFieldDefinition: { fieldName: 'alpha' } },
      { changeFieldDefinitionOrder: { fieldNames: ['gamma', 'beta'] } },
    ]);
  });

  it('sends no order action when a removal leaves the remaining fields in their original order', async () => {
    const { calls, handler } = captureUpdate(threeFields);
    useMockServerHandlers([typeHandler(threeFields()), handler]);
    renderApp();

    fireEvent.click(
      within(await fieldRow('beta')).getByRole('button', {
        name: 'Remove Field Definition',
      })
    );
    await waitFor(() => expect(fieldOrder()).toEqual(['alpha', 'gamma']));
    await save();

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].actions).toEqual([
      { removeFieldDefinition: { fieldName: 'beta' } },
    ]);
  });

  it('Revert restores the original order without sending anything', async () => {
    const { calls, handler } = captureUpdate(threeFields);
    useMockServerHandlers([typeHandler(threeFields()), handler]);
    renderApp();

    await moveUp('gamma');
    await waitFor(() =>
      expect(fieldOrder()).toEqual(['alpha', 'gamma', 'beta'])
    );
    const revert = screen.getByRole('button', { name: /revert/i });
    await waitFor(() => expect(revert).toBeEnabled());
    fireEvent.click(revert);

    await waitFor(() =>
      expect(fieldOrder()).toEqual(['alpha', 'beta', 'gamma'])
    );
    expect(calls).toHaveLength(0);
  });

  it('disables the move buttons without the manage permission', async () => {
    useMockServerHandlers([typeHandler(threeFields())]);
    renderApp({}, false);

    await fieldRow('beta');
    screen
      .getAllByRole('button', { name: /^Move field / })
      .forEach((button) => expect(button).toBeDisabled());
  });
});
