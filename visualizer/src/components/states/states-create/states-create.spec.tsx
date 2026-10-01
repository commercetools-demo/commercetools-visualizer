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
import StatesCreate from './states-create';
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

const renderApp = (type = 'orderstate') =>
  renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/states/:type/new`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <StatesCreate onClose={jest.fn()} onCreate={jest.fn()} />
      </NimbusProvider>
    </Route>,
    {
      route: `/my-project/${entryPointUriPath}/states/${type}/new`,
      environment: { entryPointUriPath },
      apolloClient: createApolloClient(),
      project: {
        allAppliedPermissions: mapResourceAccessToAppliedPermissions([
          PERMISSIONS.View,
          PERMISSIONS.Manage,
        ]),
      },
    } as Partial<TRenderAppWithReduxOptions>
  );

type CreateCall = { draft: Record<string, unknown> };

const setup = () => {
  const calls: Array<CreateCall> = [];
  mockServer.use(
    graphql.query('FetchStates', (_req, res, ctx) =>
      res(
        ctx.data({
          states: {
            __typename: 'StateQueryResult',
            total: 0,
            count: 0,
            offset: 0,
            results: [],
          },
        })
      )
    ),
    graphql.mutation('CreateState', (req, res, ctx) => {
      calls.push(req.variables as CreateCall);
      return res(
        ctx.data({ createState: { __typename: 'State', id: 'new-id' } })
      );
    })
  );
  return calls;
};

const fillKey = async () =>
  fireEvent.change(await screen.findByLabelText(/^key/i), {
    target: { value: 'my-new-state' },
  });
// The form shows a spinner while it reloads the transition options (e.g. after changing the
// type), during which there is no Save button yet.
const save = async () =>
  fireEvent.click(await screen.findByRole('button', { name: 'Save' }));
const restrictCheckbox = () =>
  screen.findByRole('checkbox', {
    name: /only allow transitions to the selected states/i,
  });
const typeSelect = async () =>
  (await screen.findAllByLabelText(/^state type/i)).find(
    (element) => element.tagName === 'BUTTON'
  ) as HTMLElement;

describe('state types', () => {
  it('offers every state type the API has, including Recurring Order State', async () => {
    setup();
    renderApp();
    fireEvent.click(await typeSelect());

    for (const label of [
      'Line Item State',
      'Order State',
      'Payment State',
      'Product State',
      'Quote Request State',
      'Quote State',
      'Recurring Order State',
      'Review State',
      'Staged Quote State',
    ]) {
      expect(
        await screen.findByRole('option', { name: label })
      ).toBeInTheDocument();
    }
  });

  it('creates a Recurring Order State', async () => {
    const calls = setup();
    renderApp();
    await fillKey();
    fireEvent.click(await typeSelect());
    fireEvent.click(
      await screen.findByRole('option', { name: 'Recurring Order State' })
    );
    await save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.type).toBe('RecurringOrderState');
  });
});

describe('transitions', () => {
  it('does not send transitions by default, so the API does not validate them', async () => {
    const calls = setup();
    renderApp();
    await fillKey();
    expect(await restrictCheckbox()).not.toBeChecked();
    await save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft).not.toHaveProperty('transitions');
  });

  it('sends an empty list when restricted with nothing selected (a final state)', async () => {
    const calls = setup();
    renderApp();
    await fillKey();
    fireEvent.click(await restrictCheckbox());
    await save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.transitions).toEqual([]);
  });
});

describe('roles', () => {
  it('sends no roles by default', async () => {
    const calls = setup();
    renderApp('lineitemstate');
    await fillKey();
    await save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft).not.toHaveProperty('roles');
  });

  it('sends the Return role of a line item state', async () => {
    const calls = setup();
    renderApp('lineitemstate');
    await fillKey();
    fireEvent.click(await screen.findByRole('checkbox', { name: /^return/i }));
    await save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.roles).toEqual(['Return']);
  });

  it('drops a role that no longer applies when the type is changed', async () => {
    const calls = setup();
    renderApp('lineitemstate');
    await fillKey();
    fireEvent.click(await screen.findByRole('checkbox', { name: /^return/i }));
    fireEvent.click(await typeSelect());
    fireEvent.click(await screen.findByRole('option', { name: 'Order State' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('checkbox', { name: /^return/i })
      ).not.toBeInTheDocument()
    );
    await save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.type).toBe('OrderState');
    expect(calls[0].draft).not.toHaveProperty('roles');
  });
});
