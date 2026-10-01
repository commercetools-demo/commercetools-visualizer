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
import ExtensionsEdit from './extensions-edit';
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

const EXTENSION_ID = '5d4d2e5e-7c3a-4f3e-9d1b-1d6a2f7a9a10';

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

const renderApp = (includeManage = true) =>
  renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/extensions/:id`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <ExtensionsEdit linkToWelcome={`/my-project/${entryPointUriPath}`} />
      </NimbusProvider>
    </Route>,
    {
      route: `/my-project/${entryPointUriPath}/extensions/${EXTENSION_ID}`,
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

const destinations = {
  http: {
    __typename: 'HttpDestination',
    type: 'HTTP',
    url: 'https://example.com/hook',
    authentication: null,
  },
  lambda: {
    __typename: 'AWSLambdaDestination',
    type: 'AWSLambda',
    arn: 'arn:aws:lambda:eu-west-1:123456789012:function:old',
    accessKey: 'AKIAXXXX',
    accessSecret: 'secret',
  },
  gcf: {
    __typename: 'GoogleCloudFunctionDestination',
    type: 'GoogleCloudFunction',
    url: 'https://europe-west1-proj.cloudfunctions.net/old',
  },
};

const buildExtension = (overrides: Record<string, unknown> = {}) => ({
  __typename: 'Extension',
  id: EXTENSION_ID,
  version: 3,
  key: 'my-extension',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastModifiedAt: '2026-01-02T00:00:00.000Z',
  timeoutInMs: null,
  expansionPaths: [],
  additionalContext: null,
  dependenciesRef: [],
  destination: destinations.http,
  triggers: [
    {
      __typename: 'Trigger',
      resourceTypeId: 'cart',
      actions: ['Create'],
      condition: null,
    },
  ],
  ...overrides,
});

type UpdateCall = {
  id: string;
  version: number;
  actions: Array<Record<string, unknown>>;
};

const setup = (extension: ReturnType<typeof buildExtension>) => {
  const calls: Array<UpdateCall> = [];
  mockServer.use(
    graphql.query('GetExtension', (_req, res, ctx) =>
      res(ctx.data({ extension }))
    ),
    graphql.mutation('UpdateExtension', (req, res, ctx) => {
      calls.push(req.variables as UpdateCall);
      return res(ctx.data({ updateExtension: extension }));
    })
  );
  return calls;
};

const expand = async (name: string) =>
  fireEvent.click(await screen.findByRole('button', { name }));
const expandDestination = () => expand('Extension Destination');
const expandTriggers = () => expand('Triggers');
const save = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
const valueOf = async (label: RegExp) =>
  ((await screen.findByLabelText(label)) as HTMLInputElement).value;
const destinationSelect = async () =>
  (await screen.findAllByLabelText(/^destination/i)).find(
    (element) => element.tagName === 'BUTTON'
  ) as HTMLElement;

describe('destination type', () => {
  it('is read-only on an existing extension', async () => {
    setup(buildExtension());
    renderApp();
    await expandDestination();

    expect(await destinationSelect()).toBeDisabled();
  });

  it('is read-only without Manage permission as well', async () => {
    setup(buildExtension());
    renderApp(false);
    await expandDestination();

    expect(await destinationSelect()).toBeDisabled();
  });
});

describe('AWS Lambda destination', () => {
  it('loads the ARN and credentials into the form', async () => {
    setup(buildExtension({ destination: destinations.lambda }));
    renderApp();
    await expandDestination();

    expect(await valueOf(/^arn/i)).toBe(destinations.lambda.arn);
    expect(await valueOf(/^accesskey/i)).toBe('AKIAXXXX');
  });

  it('saves a changed ARN as changeDestination with the complete Lambda destination', async () => {
    const calls = setup(buildExtension({ destination: destinations.lambda }));
    renderApp();
    await expandDestination();

    fireEvent.change(await screen.findByLabelText(/^arn/i), {
      target: { value: 'arn:aws:lambda:eu-west-1:123456789012:function:new' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        changeDestination: {
          destination: {
            AWSLambda: {
              arn: 'arn:aws:lambda:eu-west-1:123456789012:function:new',
              accessKey: 'AKIAXXXX',
              accessSecret: 'secret',
            },
          },
        },
      },
    ]);
    expect(calls[0]).toMatchObject({ id: EXTENSION_ID, version: 3 });
  });
});

describe('Google Cloud Function destination', () => {
  it('loads the URL into the form', async () => {
    setup(buildExtension({ destination: destinations.gcf }));
    renderApp();
    await expandDestination();

    expect(await valueOf(/url of the google cloud function/i)).toBe(
      destinations.gcf.url
    );
  });

  it('saves a changed URL as changeDestination', async () => {
    const calls = setup(buildExtension({ destination: destinations.gcf }));
    renderApp();
    await expandDestination();

    fireEvent.change(
      await screen.findByLabelText(/url of the google cloud function/i),
      { target: { value: 'https://europe-west1-proj.cloudfunctions.net/new' } }
    );
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        changeDestination: {
          destination: {
            GoogleCloudFunction: {
              url: 'https://europe-west1-proj.cloudfunctions.net/new',
            },
          },
        },
      },
    ]);
  });
});

describe('timeout', () => {
  it('shows the current timeout', async () => {
    setup(buildExtension({ timeoutInMs: 2000 }));
    renderApp();

    expect(await valueOf(/timeout \(ms\)/i)).toBe('2000');
  });

  it('saves a changed timeout as setTimeoutInMs', async () => {
    const calls = setup(buildExtension({ timeoutInMs: 2000 }));
    renderApp();

    fireEvent.change(await screen.findByLabelText(/timeout \(ms\)/i), {
      target: { value: '3000' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      { setTimeoutInMs: { timeoutInMs: 3000 } },
    ]);
  });

  it('saves a cleared timeout as setTimeoutInMs without a value (back to the default)', async () => {
    const calls = setup(buildExtension({ timeoutInMs: 2000 }));
    renderApp();

    fireEvent.change(await screen.findByLabelText(/timeout \(ms\)/i), {
      target: { value: '' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toHaveLength(1);
    expect(calls[0].actions[0]).toHaveProperty('setTimeoutInMs');
    expect(
      (calls[0].actions[0].setTimeoutInMs as { timeoutInMs?: number })
        .timeoutInMs
    ).toBeUndefined();
  });

  it('does not save an invalid timeout', async () => {
    const calls = setup(buildExtension({ timeoutInMs: 2000 }));
    renderApp();

    const timeout = await screen.findByLabelText(/timeout \(ms\)/i);
    fireEvent.change(timeout, { target: { value: '-1' } });
    fireEvent.blur(timeout);
    expect(
      await screen.findByText(/whole number of milliseconds greater than 0/i)
    ).toBeInTheDocument();
    save();
    await settle();

    expect(calls).toHaveLength(0);
  });

  it('is read-only without Manage permission', async () => {
    setup(buildExtension({ timeoutInMs: 2000 }));
    renderApp(false);

    expect(await screen.findByLabelText(/timeout \(ms\)/i)).toHaveAttribute(
      'readonly'
    );
  });
});

describe('triggers', () => {
  it('shows the newly supported resource types', async () => {
    setup(buildExtension());
    renderApp();
    await expandTriggers();

    for (const id of [
      'payment-method',
      'customer-group',
      'shopping-list',
      'product',
    ]) {
      expect(
        await screen.findByRole('checkbox', { name: `${id} Create` })
      ).toBeInTheDocument();
    }
  });

  it('keeps a trigger’s condition when another action is enabled on it', async () => {
    const calls = setup(
      buildExtension({
        triggers: [
          {
            __typename: 'Trigger',
            resourceTypeId: 'cart',
            actions: ['Create'],
            condition: 'customerId is defined',
          },
        ],
      })
    );
    renderApp();
    await expandTriggers();

    fireEvent.click(
      await screen.findByRole('checkbox', { name: 'cart Update' })
    );
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        changeTriggers: {
          triggers: [
            {
              resourceTypeId: 'cart',
              actions: ['Create', 'Update'],
              condition: 'customerId is defined',
            },
          ],
        },
      },
    ]);
  });

  it('saves a trigger added for a newly supported resource type', async () => {
    const calls = setup(buildExtension());
    renderApp();
    await expandTriggers();

    fireEvent.click(
      await screen.findByRole('checkbox', { name: 'product Update' })
    );
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        changeTriggers: {
          triggers: expect.arrayContaining([
            { resourceTypeId: 'product', actions: ['Update'] },
          ]),
        },
      },
    ]);
  });
});

describe('trigger condition', () => {
  const withCondition = (condition: string | null) =>
    buildExtension({
      triggers: [
        {
          __typename: 'Trigger',
          resourceTypeId: 'cart',
          actions: ['Create'],
          condition,
        },
      ],
    });

  it('shows the current condition', async () => {
    setup(withCondition('customerId is defined'));
    renderApp();
    await expandTriggers();

    expect(
      ((await screen.findByLabelText('cart condition')) as HTMLInputElement)
        .value
    ).toBe('customerId is defined');
  });

  it('saves a changed condition with changeTriggers', async () => {
    const calls = setup(withCondition('customerId is defined'));
    renderApp();
    await expandTriggers();

    fireEvent.change(await screen.findByLabelText('cart condition'), {
      target: { value: 'totalPrice.centAmount > 1000' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        changeTriggers: {
          triggers: [
            {
              resourceTypeId: 'cart',
              actions: ['Create'],
              condition: 'totalPrice.centAmount > 1000',
            },
          ],
        },
      },
    ]);
  });

  it('saves a cleared condition by sending the trigger without one', async () => {
    const calls = setup(withCondition('customerId is defined'));
    renderApp();
    await expandTriggers();

    fireEvent.change(await screen.findByLabelText('cart condition'), {
      target: { value: '' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        changeTriggers: {
          triggers: [{ resourceTypeId: 'cart', actions: ['Create'] }],
        },
      },
    ]);
  });

  it('is read-only without Manage permission', async () => {
    setup(withCondition('customerId is defined'));
    renderApp(false);
    await expandTriggers();

    expect(await screen.findByLabelText('cart condition')).toHaveAttribute(
      'readonly'
    );
  });
});

describe('a resource type with several triggers', () => {
  const multi = () =>
    buildExtension({
      timeoutInMs: 1000,
      triggers: [
        {
          __typename: 'Trigger',
          resourceTypeId: 'cart',
          actions: ['Create'],
          condition: 'customerId is defined',
        },
        {
          __typename: 'Trigger',
          resourceTypeId: 'cart',
          actions: ['Update'],
          condition: 'totalPrice.centAmount > 1000',
        },
      ],
    });

  it('is shown as read-only, with a note', async () => {
    setup(multi());
    renderApp();
    await expandTriggers();

    expect(
      await screen.findByText(
        /2 triggers with their own conditions exist for this resource type/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'cart Create' })
    ).toBeDisabled();
    expect(
      screen.getByRole('checkbox', { name: 'cart Update' })
    ).toBeDisabled();
    expect(screen.getByLabelText('cart condition')).toBeDisabled();
  });

  it('is left untouched when something else is saved', async () => {
    const calls = setup(multi());
    renderApp();

    fireEvent.change(await screen.findByLabelText(/timeout \(ms\)/i), {
      target: { value: '3000' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      { setTimeoutInMs: { timeoutInMs: 3000 } },
    ]);
  });
});

describe('include previous resource state', () => {
  const checkbox = () =>
    screen.findByRole('checkbox', {
      name: /include the previous resource state/i,
    });

  it('shows the stored value', async () => {
    setup(buildExtension({ additionalContext: { includeOldResource: true } }));
    renderApp();

    expect(await checkbox()).toBeChecked();
  });

  it('saves switching it on with setAdditionalContext', async () => {
    const calls = setup(buildExtension());
    renderApp();
    fireEvent.click(await checkbox());
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        setAdditionalContext: {
          additionalContext: { includeOldResource: true },
        },
      },
    ]);
  });

  it('saves switching it off with includeOldResource false', async () => {
    const calls = setup(
      buildExtension({ additionalContext: { includeOldResource: true } })
    );
    renderApp();
    fireEvent.click(await checkbox());
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        setAdditionalContext: {
          additionalContext: { includeOldResource: false },
        },
      },
    ]);
  });
});

describe('expansion paths', () => {
  const expandPaths = () => expand('Expansion Paths');

  it('shows the stored paths', async () => {
    setup(
      buildExtension({
        expansionPaths: ['lineItems[*].variant', 'customerGroup'],
      })
    );
    renderApp();
    await expandPaths();

    expect(
      ((await screen.findByLabelText('Expansion path 1')) as HTMLInputElement)
        .value
    ).toBe('lineItems[*].variant');
    expect(
      (screen.getByLabelText('Expansion path 2') as HTMLInputElement).value
    ).toBe('customerGroup');
  });

  it('saves an added path with setExpansionPaths (the full list)', async () => {
    const calls = setup(buildExtension({ expansionPaths: ['customerGroup'] }));
    renderApp();
    await expandPaths();

    fireEvent.click(
      await screen.findByRole('button', { name: /add expansion path/i })
    );
    fireEvent.change(await screen.findByLabelText('Expansion path 2'), {
      target: { value: 'lineItems[*].variant' },
    });
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        setExpansionPaths: {
          expansionPaths: ['customerGroup', 'lineItems[*].variant'],
        },
      },
    ]);
  });

  it('saves removing all paths with an empty list', async () => {
    const calls = setup(buildExtension({ expansionPaths: ['customerGroup'] }));
    renderApp();
    await expandPaths();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Remove expansion path 1' })
    );
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      { setExpansionPaths: { expansionPaths: [] } },
    ]);
  });

  it('disables adding when the stored extension already has 3 paths', async () => {
    setup(buildExtension({ expansionPaths: ['a', 'b', 'c'] }));
    renderApp();
    await expandPaths();

    expect(
      await screen.findByRole('button', { name: /add expansion path/i })
    ).toBeDisabled();
  });

  it('is read-only without Manage permission', async () => {
    setup(buildExtension({ expansionPaths: ['customerGroup'] }));
    renderApp(false);
    await expandPaths();

    expect(await screen.findByLabelText('Expansion path 1')).toHaveAttribute(
      'readonly'
    );
    expect(
      screen.getByRole('button', { name: /add expansion path/i })
    ).toBeDisabled();
  });
});

describe('dependencies', () => {
  const ref = (id: string) => ({
    __typename: 'Reference',
    typeId: 'extension',
    id,
  });
  const expandDependencies = () => expand('Dependencies');

  it('never offers the extension itself', async () => {
    mockCandidates([
      { id: EXTENSION_ID, key: 'my-extension' },
      { id: 'ext-a', key: 'alpha' },
    ]);
    setup(buildExtension());
    renderApp();
    await expandDependencies();

    expect(
      await screen.findByRole('checkbox', { name: 'alpha' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: 'my-extension' })
    ).not.toBeInTheDocument();
  });

  it('shows the stored dependencies as selected', async () => {
    mockCandidates([
      { id: 'ext-a', key: 'alpha' },
      { id: 'ext-b', key: 'beta' },
    ]);
    setup(buildExtension({ dependenciesRef: [ref('ext-b')] }));
    renderApp();
    await expandDependencies();

    expect(await screen.findByRole('checkbox', { name: 'beta' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'alpha' })).not.toBeChecked();
  });

  it('saves a chosen dependency with setDependencies', async () => {
    mockCandidates([{ id: 'ext-a', key: 'alpha' }]);
    const calls = setup(buildExtension());
    renderApp();
    await expandDependencies();

    fireEvent.click(await screen.findByRole('checkbox', { name: 'alpha' }));
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      {
        setDependencies: {
          dependencies: [{ typeId: 'extension', id: 'ext-a' }],
        },
      },
    ]);
  });

  it('saves removing the last dependency with an empty list', async () => {
    mockCandidates([{ id: 'ext-a', key: 'alpha' }]);
    const calls = setup(buildExtension({ dependenciesRef: [ref('ext-a')] }));
    renderApp();
    await expandDependencies();

    fireEvent.click(await screen.findByRole('checkbox', { name: 'alpha' }));
    save();

    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
    expect(calls[0].actions).toEqual([
      { setDependencies: { dependencies: [] } },
    ]);
  });

  it('does not offer an extension that would create a circular dependency', async () => {
    mockCandidates([
      { id: 'ext-a', key: 'alpha', dependsOn: ['ext-b'] },
      { id: 'ext-b', key: 'beta', dependsOn: [EXTENSION_ID] },
      { id: 'ext-c', key: 'gamma' },
    ]);
    setup(buildExtension());
    renderApp();
    await expandDependencies();

    // beta depends on this extension directly, alpha through beta
    expect(
      await screen.findByRole('checkbox', { name: 'beta' })
    ).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'alpha' })).toBeDisabled();
    expect(
      screen.getAllByText(/would create a circular dependency/i)
    ).toHaveLength(2);
    expect(screen.getByRole('checkbox', { name: 'gamma' })).toBeEnabled();
  });

  it('re-checks applicability when the triggers change', async () => {
    mockCandidates([
      {
        id: 'ext-cart',
        key: 'cart-only',
        triggers: [{ resourceTypeId: 'cart', actions: ['Create'] }],
      },
    ]);
    setup(buildExtension());
    renderApp();
    await expandTriggers();
    await expandDependencies();

    expect(
      await screen.findByRole('checkbox', { name: 'cart-only' })
    ).toBeEnabled();

    // the extension is now also triggered for orders, which cart-only is not
    fireEvent.click(screen.getByRole('checkbox', { name: 'order Create' }));
    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: 'cart-only' })).toBeDisabled()
    );
  });

  it('blocks saving a stored dependency that no longer covers the triggers', async () => {
    mockCandidates([
      {
        id: 'ext-cart',
        key: 'cart-only',
        triggers: [{ resourceTypeId: 'cart', actions: ['Create'] }],
      },
    ]);
    const calls = setup(buildExtension({ dependenciesRef: [ref('ext-cart')] }));
    renderApp();
    await expandTriggers();
    await expandDependencies();
    await screen.findByRole('checkbox', { name: 'cart-only' });

    fireEvent.click(screen.getByRole('checkbox', { name: 'order Create' }));
    expect(
      await screen.findByText(
        /not triggered for every resource type and action of this extension/i
      )
    ).toBeInTheDocument();
    save();
    await settle();

    expect(calls).toHaveLength(0);
    // the stale choice can be removed, which makes the form saveable again
    fireEvent.click(screen.getByRole('checkbox', { name: 'cart-only' }));
    save();
    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 8000 });
  });

  it('flags a stored dependency whose extension no longer exists', async () => {
    mockCandidates([]);
    setup(buildExtension({ dependenciesRef: [ref('ext-gone')] }));
    renderApp();
    await expandDependencies();

    expect(
      await screen.findByText(/the extension ext-gone no longer exists/i)
    ).toBeInTheDocument();
  });

  it('tells the user when the other extensions could not be loaded', async () => {
    mockServer.use(
      graphql.query('FetchExtensionDependencyCandidates', (_req, res, ctx) =>
        res(ctx.errors([{ message: 'boom' }]))
      )
    );
    setup(buildExtension());
    renderApp();
    await expandDependencies();

    expect(
      await screen.findByText(/the other extensions could not be loaded/i)
    ).toBeInTheDocument();
  });

  it('is read-only without Manage permission', async () => {
    mockCandidates([{ id: 'ext-a', key: 'alpha' }]);
    setup(buildExtension({ dependenciesRef: [ref('ext-a')] }));
    renderApp(false);
    await expandDependencies();

    expect(
      await screen.findByRole('checkbox', { name: 'alpha' })
    ).toBeChecked();
  });
});
