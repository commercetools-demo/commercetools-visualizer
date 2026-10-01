import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import { Route } from 'react-router-dom';
import {
  fireEvent,
  screen,
  waitFor,
  mapResourceAccessToAppliedPermissions,
  renderAppWithRedux,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { NimbusProvider } from '@commercetools/nimbus';
import { cleanup } from '@testing-library/react';
import StatesEdit from './states-edit';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';

// Each test renders the whole form (Nimbus, combo boxes), which can take a few seconds when
// the suite runs in parallel — the 5s default is too tight.
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

const STATE_ID = '8a1f3c52-3f1a-4d0e-b0a5-6a0d2d6c9b11';

const renderApp = (includeManage = true) =>
  renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/states/:id`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <StatesEdit onClose={jest.fn()} />
      </NimbusProvider>
    </Route>,
    {
      route: `/my-project/${entryPointUriPath}/states/${STATE_ID}`,
      environment: { entryPointUriPath },
      apolloClient: createApolloClient(),
      project: {
        allAppliedPermissions: mapResourceAccessToAppliedPermissions(
          [PERMISSIONS.View, includeManage ? PERMISSIONS.Manage : ''].filter(
            Boolean
          )
        ),
      },
    } as Partial<TRenderAppWithReduxOptions>
  );

const name = (value: string) => [
  { __typename: 'LocalizedString', locale: 'en', value },
];

const buildState = (overrides: Record<string, unknown> = {}) => ({
  __typename: 'State',
  id: STATE_ID,
  version: 4,
  key: 'my-state',
  type: 'OrderState',
  initial: false,
  builtIn: false,
  roles: [],
  transitions: null,
  nameAllLocales: name('My state'),
  descriptionAllLocales: [],
  ...overrides,
});

const otherState = (id: string, label: string) => ({
  __typename: 'State',
  id,
  key: `key-${id}`,
  type: 'OrderState',
  initial: false,
  builtIn: false,
  roles: [],
  transitions: null,
  nameAllLocales: name(label),
  descriptionAllLocales: [],
});

type UpdateCall = {
  id: string;
  version: number;
  actions: Array<Record<string, unknown>>;
};

const setup = (state: ReturnType<typeof buildState>) => {
  const calls: Array<UpdateCall> = [];
  mockServer.use(
    graphql.query('FetchState', (_req, res, ctx) => res(ctx.data({ state }))),
    graphql.query('FetchStates', (_req, res, ctx) =>
      res(
        ctx.data({
          states: {
            __typename: 'StateQueryResult',
            total: 2,
            count: 2,
            offset: 0,
            results: [
              otherState('other-1', 'Shipped'),
              otherState('other-2', 'Done'),
            ],
          },
        })
      )
    ),
    graphql.mutation('UpdateState', (req, res, ctx) => {
      calls.push(req.variables as UpdateCall);
      return res(ctx.data({ updateState: state }));
    })
  );
  return calls;
};

const restrictCheckbox = () =>
  screen.findByRole('checkbox', {
    name: /only allow transitions to the selected states/i,
  });
const transitionsCombobox = () =>
  screen.findByRole('combobox', { name: /^transitions/i });
const save = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
const rename = async (value: string) =>
  fireEvent.change(await screen.findByDisplayValue('My state'), {
    target: { value },
  });
const kinds = (call: UpdateCall) => call.actions.map((a) => Object.keys(a)[0]);

describe('transitions', () => {
  it('shows a state without transitions as unrestricted, with the selection disabled', async () => {
    setup(buildState({ transitions: null }));
    renderApp();

    expect(await restrictCheckbox()).not.toBeChecked();
    expect(await transitionsCombobox()).toBeDisabled();
  });

  it('shows a state with transitions as restricted', async () => {
    setup(
      buildState({ transitions: [{ __typename: 'State', id: 'other-1' }] })
    );
    renderApp();

    expect(await restrictCheckbox()).toBeChecked();
    expect(await transitionsCombobox()).toBeEnabled();
  });

  it('shows a state with an empty transition list (a final state) as restricted', async () => {
    setup(buildState({ transitions: [] }));
    renderApp();

    expect(await restrictCheckbox()).toBeChecked();
  });

  it('does not turn unrestricted transitions into "none" when only the name changes', async () => {
    // Regression: this used to also send `setTransitions: []`, which makes the state a final
    // one — no resource could be moved out of it any more.
    const calls = setup(buildState({ transitions: null }));
    renderApp();
    await rename('Renamed');
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(kinds(calls[0])).toEqual(['setName']);
  });

  it('turning the restriction on without a selection makes it a final state', async () => {
    const calls = setup(buildState({ transitions: null }));
    renderApp();
    fireEvent.click(await restrictCheckbox());
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([{ setTransitions: { transitions: [] } }]);
  });

  it('turning the restriction off removes the transitions', async () => {
    const calls = setup(
      buildState({ transitions: [{ __typename: 'State', id: 'other-1' }] })
    );
    renderApp();
    fireEvent.click(await restrictCheckbox());
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toHaveLength(1);
    expect(calls[0].actions[0]).toHaveProperty('setTransitions');
    expect(
      (calls[0].actions[0].setTransitions as { transitions?: unknown })
        .transitions
    ).toBeUndefined();
  });

  it('is read-only without Manage permission', async () => {
    setup(buildState({ transitions: null }));
    renderApp(false);

    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

describe('roles', () => {
  it('offers no roles for a state type that has none', async () => {
    setup(buildState({ type: 'OrderState' }));
    renderApp();
    await restrictCheckbox();

    expect(screen.queryByText('Roles')).not.toBeInTheDocument();
  });

  it('offers the Return role for a line item state, and saves it with addRoles', async () => {
    const calls = setup(buildState({ type: 'LineItemState', roles: [] }));
    renderApp();

    fireEvent.click(await screen.findByRole('checkbox', { name: /^return/i }));
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([{ addRoles: { roles: ['Return'] } }]);
    expect(
      screen.queryByRole('checkbox', { name: /rating counts/i })
    ).not.toBeInTheDocument();
  });

  it('shows the stored role as checked and saves unchecking it with removeRoles', async () => {
    const calls = setup(
      buildState({ type: 'LineItemState', roles: ['Return'] })
    );
    renderApp();

    const checkbox = await screen.findByRole('checkbox', { name: /^return/i });
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([{ removeRoles: { roles: ['Return'] } }]);
  });

  it('offers only the statistics role for a review state', async () => {
    setup(buildState({ type: 'ReviewState', roles: [] }));
    renderApp();

    expect(
      await screen.findByRole('checkbox', { name: /rating counts/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /^return/i })
    ).not.toBeInTheDocument();
  });
});

describe('built-in states', () => {
  it('cannot be deleted, and say why', async () => {
    setup(buildState({ builtIn: true, type: 'LineItemState' }));
    renderApp();

    expect(
      await screen.findByRole('button', { name: 'Delete' })
    ).toBeDisabled();
    expect(
      screen.getByText(
        /built-in state: its key can't be changed and it can't be deleted/i
      )
    ).toBeInTheDocument();
  });

  it('have a read-only key and a type that cannot be changed', async () => {
    setup(buildState({ builtIn: true, type: 'LineItemState' }));
    renderApp();

    expect(await screen.findByDisplayValue('my-state')).toHaveAttribute(
      'readonly'
    );
    const typeSelect = (await screen.findAllByLabelText(/^state type/i)).find(
      (element) => element.tagName === 'BUTTON'
    ) as HTMLElement;
    expect(typeSelect).toBeDisabled();
  });

  it('other states can be deleted', async () => {
    setup(buildState({ builtIn: false }));
    renderApp();

    expect(await screen.findByRole('button', { name: 'Delete' })).toBeEnabled();
    expect(screen.queryByText(/built-in state/i)).not.toBeInTheDocument();
  });
});

describe('key and type of a state that is not built in', () => {
  it('can be changed: the key is saved with changeKey', async () => {
    const calls = setup(buildState({ builtIn: false }));
    renderApp();

    fireEvent.change(await screen.findByDisplayValue('my-state'), {
      target: { value: 'renamed-state' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([{ changeKey: { key: 'renamed-state' } }]);
  });

  it('can be changed: the type is saved with changeType', async () => {
    const calls = setup(buildState({ builtIn: false, type: 'OrderState' }));
    renderApp();

    const select = (await screen.findAllByLabelText(/^state type/i)).find(
      (element) => element.tagName === 'BUTTON'
    ) as HTMLElement;
    expect(select).toBeEnabled();
    fireEvent.click(select);
    fireEvent.click(
      await screen.findByRole('option', { name: 'Recurring Order State' })
    );
    // changing the type reloads the transition options, hiding the footer for a moment
    fireEvent.click(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      { changeType: { type: 'RecurringOrderState' } },
    ]);
  });
});
