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
import { act, cleanup } from '@testing-library/react';
import ExtensionsCreate from './extensions-create';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';

// Each test renders the whole form (Nimbus + accordions), which can take a few seconds when
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

type Candidate = {
  id: string;
  key?: string | null;
  triggers?: Array<{ resourceTypeId: string; actions: Array<string> }>;
  dependsOn?: Array<string>;
};

// The other extensions of the project, as loaded for the Dependencies section.
const mockCandidates = (candidates: Array<Candidate> = []) =>
  mockServer.use(
    graphql.query('FetchExtensionDependencyCandidates', (_req, res, ctx) =>
      res(
        ctx.data({
          extensions: {
            __typename: 'ExtensionQueryResult',
            results: candidates.map((candidate) => ({
              __typename: 'Extension',
              id: candidate.id,
              key: candidate.key ?? null,
              triggers: (
                candidate.triggers ?? [
                  { resourceTypeId: 'cart', actions: ['Create', 'Update'] },
                ]
              ).map((trigger) => ({ __typename: 'Trigger', ...trigger })),
              dependenciesRef: (candidate.dependsOn ?? []).map((id) => ({
                __typename: 'Reference',
                typeId: 'extension',
                id,
              })),
            })),
          },
        })
      )
    )
  );

beforeEach(() => mockCandidates());

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route =
    options.route || `/my-project/${entryPointUriPath}/extensions/new`;
  return renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/extensions/new`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <ExtensionsCreate linkToWelcome={`/my-project/${entryPointUriPath}`} />
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

type CreateCall = { draft: Record<string, unknown> };

const captureCreate = () => {
  const calls: Array<CreateCall> = [];
  mockServer.use(
    graphql.mutation('CreateExtension', (req, res, ctx) => {
      calls.push(req.variables as CreateCall);
      return res(ctx.data({ createExtension: { id: 'new-extension-id' } }));
    })
  );
  return calls;
};

// The destination is a (non-searchable) select whose trigger is a button labelled
// "Destination"; it also has a hidden input with the same label.
const destinationSelect = async () =>
  (await screen.findAllByLabelText(/^destination/i)).find(
    (element) => element.tagName === 'BUTTON'
  ) as HTMLElement;

const chooseDestination = async (name: string) => {
  fireEvent.click(await destinationSelect());
  fireEvent.click(await screen.findByRole('option', { name }));
};

const fillKey = async () =>
  fireEvent.change(await screen.findByLabelText(/extension key/i), {
    target: { value: 'my-extension' },
  });

const checkTrigger = (resourceTypeId: string, action: 'Create' | 'Update') =>
  fireEvent.click(
    screen.getByRole('checkbox', { name: `${resourceTypeId} ${action}` })
  );

// Lets the (async) form validation/submit finish, so "nothing was sent" is a real result.
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });

const save = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

const fillMinimum = async () => {
  await fillKey();
  await chooseDestination('Google Cloud Function');
  fireEvent.change(
    await screen.findByLabelText(/url of the google cloud function/i),
    {
      target: { value: 'https://fn.example.com' },
    }
  );
  checkTrigger('cart', 'Create');
};

describe('destination types', () => {
  it('offers HTTP, AWS Lambda and Google Cloud Function', async () => {
    renderApp();
    fireEvent.click(await destinationSelect());

    for (const name of ['HTTP', 'AWS Lambda', 'Google Cloud Function']) {
      expect(await screen.findByRole('option', { name })).toBeInTheDocument();
    }
  });

  it('creates an extension with a Google Cloud Function destination', async () => {
    const calls = captureCreate();
    renderApp();

    await fillKey();
    await chooseDestination('Google Cloud Function');
    fireEvent.change(
      await screen.findByLabelText(/url of the google cloud function/i),
      { target: { value: 'https://europe-west1-proj.cloudfunctions.net/fn' } }
    );
    checkTrigger('cart', 'Create');
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft).toMatchObject({
      key: 'my-extension',
      destination: {
        GoogleCloudFunction: {
          url: 'https://europe-west1-proj.cloudfunctions.net/fn',
        },
      },
      triggers: [{ resourceTypeId: 'cart', actions: ['Create'] }],
    });
  });

  it('does not submit a Google Cloud Function destination without a URL', async () => {
    const calls = captureCreate();
    renderApp();

    await fillKey();
    await chooseDestination('Google Cloud Function');
    await screen.findByLabelText(/url of the google cloud function/i);
    checkTrigger('cart', 'Create');
    save();

    await settle();
    expect(calls).toHaveLength(0);
  });
});

describe('timeout', () => {
  it('sends the timeout as a number', async () => {
    const calls = captureCreate();
    renderApp();
    await fillMinimum();
    fireEvent.change(await screen.findByLabelText('Timeout (ms)'), {
      target: { value: '5000' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.timeoutInMs).toBe(5000);
  });

  it('leaves the timeout out when the field is empty', async () => {
    const calls = captureCreate();
    renderApp();
    await fillMinimum();
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft).not.toHaveProperty('timeoutInMs');
  });

  it.each(['0', '-5', '1.5', 'abc'])(
    'rejects the timeout %p and does not submit',
    async (value) => {
      const calls = captureCreate();
      renderApp();
      await fillMinimum();
      const timeout = await screen.findByLabelText('Timeout (ms)');
      fireEvent.change(timeout, { target: { value } });
      fireEvent.blur(timeout);

      expect(
        await screen.findByText(/whole number of milliseconds greater than 0/i)
      ).toBeInTheDocument();
      save();
      await settle();
      expect(calls).toHaveLength(0);
    }
  );
});

describe('trigger resource types', () => {
  it('offers every resource type the API allows', async () => {
    renderApp();
    await screen.findByLabelText(/extension key/i);

    [
      'cart',
      'order',
      'payment',
      'payment-method',
      'customer',
      'customer-group',
      'quote-request',
      'staged-quote',
      'quote',
      'business-unit',
      'shopping-list',
      'product',
    ].forEach((id) => {
      expect(
        screen.getByRole('checkbox', { name: `${id} Create` })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: `${id} Update` })
      ).toBeInTheDocument();
    });
  });

  it('creates an extension triggered for a newly supported resource type', async () => {
    const calls = captureCreate();
    renderApp();
    await fillKey();
    await chooseDestination('HTTP');
    fireEvent.change(
      await screen.findByLabelText(/url to the target destination/i),
      {
        target: { value: 'https://example.com/hook' },
      }
    );
    checkTrigger('product', 'Update');
    checkTrigger('shopping-list', 'Create');
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.triggers).toEqual(
      expect.arrayContaining([
        { resourceTypeId: 'product', actions: ['Update'] },
        { resourceTypeId: 'shopping-list', actions: ['Create'] },
      ])
    );
  });
});

describe('include previous resource state', () => {
  it('is off by default and sends no additionalContext', async () => {
    const calls = captureCreate();
    renderApp();
    await fillMinimum();
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft).not.toHaveProperty('additionalContext');
  });

  it('sends includeOldResource when checked', async () => {
    const calls = captureCreate();
    renderApp();
    await fillMinimum();
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: /include the previous resource state/i,
      })
    );
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.additionalContext).toEqual({
      includeOldResource: true,
    });
  });
});

describe('trigger condition', () => {
  it('can only be entered for a resource that has an action selected', async () => {
    renderApp();
    await screen.findByLabelText(/extension key/i);

    const condition = screen.getByLabelText('cart condition');
    expect(condition).toBeDisabled();
    checkTrigger('cart', 'Create');
    await waitFor(() => expect(condition).toBeEnabled());
  });

  it('sends the condition with the trigger', async () => {
    const calls = captureCreate();
    renderApp();
    await fillMinimum();
    fireEvent.change(screen.getByLabelText('cart condition'), {
      target: { value: 'customerId is defined' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.triggers).toEqual([
      {
        resourceTypeId: 'cart',
        actions: ['Create'],
        condition: 'customerId is defined',
      },
    ]);
  });

  it('warns that an unevaluable condition makes the API call fail', async () => {
    renderApp();
    expect(
      await screen.findByText(
        /cannot be evaluated makes the whole api call fail/i
      )
    ).toBeInTheDocument();
  });
});

describe('expansion paths', () => {
  const expandPaths = () =>
    fireEvent.click(screen.getByRole('button', { name: 'Expansion Paths' }));
  const addPath = () =>
    fireEvent.click(
      screen.getByRole('button', { name: /add expansion path/i })
    );

  it('sends the entered paths, trimmed, and drops blank rows', async () => {
    const calls = captureCreate();
    renderApp();
    await fillMinimum();
    expandPaths();
    addPath();
    addPath();
    addPath();
    fireEvent.change(await screen.findByLabelText('Expansion path 1'), {
      target: { value: ' lineItems[*].variant ' },
    });
    fireEvent.change(screen.getByLabelText('Expansion path 2'), {
      target: { value: 'customerGroup' },
    });
    // path 3 stays blank
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.expansionPaths).toEqual([
      'lineItems[*].variant',
      'customerGroup',
    ]);
  });

  it('sends no expansionPaths when there are none', async () => {
    const calls = captureCreate();
    renderApp();
    await fillMinimum();
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft).not.toHaveProperty('expansionPaths');
  });

  it('allows at most 3 paths (the documented limit)', async () => {
    renderApp();
    await screen.findByLabelText(/extension key/i);
    expandPaths();
    addPath();
    addPath();
    addPath();

    expect(
      await screen.findByLabelText('Expansion path 3')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add expansion path/i })
    ).toBeDisabled();
  });

  it('lets a path be removed again, which re-enables adding', async () => {
    renderApp();
    await screen.findByLabelText(/extension key/i);
    expandPaths();
    addPath();
    addPath();
    addPath();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Remove expansion path 3' })
    );

    await waitFor(() =>
      expect(
        screen.queryByLabelText('Expansion path 3')
      ).not.toBeInTheDocument()
    );
    expect(
      screen.getByRole('button', { name: /add expansion path/i })
    ).toBeEnabled();
  });

  it('does not submit the same path twice', async () => {
    const calls = captureCreate();
    renderApp();
    await fillMinimum();
    expandPaths();
    addPath();
    addPath();
    fireEvent.change(await screen.findByLabelText('Expansion path 1'), {
      target: { value: 'customerGroup' },
    });
    fireEvent.change(screen.getByLabelText('Expansion path 2'), {
      target: { value: 'customerGroup' },
    });

    expect(
      await screen.findByText(/each expansion path may only be used once/i)
    ).toBeInTheDocument();
    save();
    await settle();
    expect(calls).toHaveLength(0);
  });
});

describe('dependencies', () => {
  const expandDependencies = () =>
    fireEvent.click(screen.getByRole('button', { name: 'Dependencies' }));

  it('says so when there are no other extensions', async () => {
    renderApp();
    await screen.findByLabelText(/extension key/i);
    expandDependencies();

    expect(
      await screen.findByText(/there are no other extensions to depend on/i)
    ).toBeInTheDocument();
  });

  it('explains the restrictions', async () => {
    renderApp();
    await screen.findByLabelText(/extension key/i);
    expandDependencies();

    expect(
      await screen.findByText(
        /at most 5 direct dependencies, no circular dependencies and a chain of at most 3 layers/i
      )
    ).toBeInTheDocument();
  });

  it('sends the chosen dependencies as extension identifiers', async () => {
    mockCandidates([
      { id: 'ext-a', key: 'alpha' },
      { id: 'ext-b', key: 'beta' },
    ]);
    const calls = captureCreate();
    renderApp();
    await fillMinimum();
    expandDependencies();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'beta' }));
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].draft.dependencies).toEqual([
      { typeId: 'extension', id: 'ext-b' },
    ]);
  });

  it('shows the id for an extension without a key', async () => {
    mockCandidates([{ id: 'ext-without-key', key: null }]);
    renderApp();
    await screen.findByLabelText(/extension key/i);
    expandDependencies();

    expect(
      await screen.findByRole('checkbox', { name: 'ext-without-key' })
    ).toBeInTheDocument();
  });

  it('does not offer an extension that is not triggered for every resource type and action of this one', async () => {
    mockCandidates([
      {
        id: 'ext-order',
        key: 'order-only',
        triggers: [{ resourceTypeId: 'order', actions: ['Create'] }],
      },
      { id: 'ext-cart', key: 'cart-ok' },
    ]);
    renderApp();
    await fillMinimum(); // triggered for cart / Create
    expandDependencies();

    expect(
      await screen.findByRole('checkbox', { name: 'order-only' })
    ).toBeDisabled();
    expect(
      screen.getByText(
        /not triggered for every resource type and action of this extension/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'cart-ok' })).toBeEnabled();
  });

  it('allows at most 5 dependencies (the documented limit)', async () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    mockCandidates(ids.map((id) => ({ id: `ext-${id}`, key: `key-${id}` })));
    renderApp();
    await fillMinimum();
    expandDependencies();

    for (const id of ids.slice(0, 5)) {
      fireEvent.click(
        await screen.findByRole('checkbox', { name: `key-${id}` })
      );
    }

    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: 'key-f' })).toBeDisabled()
    );
    expect(
      screen.getByText(/a maximum of 5 dependencies is allowed/i)
    ).toBeInTheDocument();
    // the chosen ones stay changeable
    expect(screen.getByRole('checkbox', { name: 'key-a' })).toBeEnabled();
  });
});
