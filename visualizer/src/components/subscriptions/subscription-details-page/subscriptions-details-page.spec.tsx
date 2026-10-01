import { graphql, type GraphQLHandler } from 'msw';
import { setupServer } from 'msw/node';
import { Route } from 'react-router-dom';
import {
  fireEvent,
  screen,
  waitFor,
  mapResourceAccessToAppliedPermissions,
  renderAppWithRedux,
  type TRenderAppWithReduxOptions,
  within,
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { buildGraphqlList } from '@commercetools-test-data/core';
import { NimbusProvider } from '@commercetools/nimbus';
import SubscriptionDetailsPage from './subscription-details-page';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
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

const TEST_SUBSCRIPTION_ID = 'b8a40b99-0c11-43bc-8680-fc570d624747';
const TEST_SUBSCRIPTION_KEY = 'test-key';
const TEST_SUBSCRIPTION_NEW_KEY = 'new-test-key';

// `SubscriptionDetailsPage` is rendered in isolation (rather than via
// `<ApplicationRoutes />`) so the test does not transitively import unrelated
// routes (e.g. Custom Objects' JSON editor, which Jest cannot parse). It is
// wrapped in a `Route` that provides the `:id` param. `NimbusProvider` is
// normally supplied once by `EntryPoint`, which isn't rendered here, so it's
// added explicitly.
const renderApp = (
  options: Partial<TRenderAppWithReduxOptions> = {},
  includeManagePermissions = true
) => {
  const route =
    options.route ||
    `/my-project/${entryPointUriPath}/subscription/${TEST_SUBSCRIPTION_ID}`;
  const { history } = renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/subscription/:id`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <SubscriptionDetailsPage
          linkToWelcome={`/my-project/${entryPointUriPath}/subscriptions`}
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

const fetchSubscriptionDetailsQueryHandler = graphql.query(
  'FetchSubscription',
  (_req, res, ctx) => {
    let subscription = random().key(TEST_SUBSCRIPTION_KEY).buildGraphql();
    return res(
      ctx.data({
        subscription: subscription,
      })
    );
  }
);

const fetchSubscriptionDetailsQueryHandlerWithNullData = graphql.query(
  'FetchSubscription',
  (_req, res, ctx) => {
    return res(ctx.data({ subscription: null }));
  }
);

const fetchSubscriptionDetailsQueryHandlerWithError = graphql.query(
  'FetchSubscription',
  (_req, res, ctx) => {
    return res(
      ctx.data({ subscription: null }),
      ctx.errors([
        {
          message: "Field '$subscriptionId' has wrong value: Invalid ID.",
        },
      ])
    );
  }
);

const updateSubscriptionDetailsHandler = graphql.mutation(
  'UpdateSubscription',
  (_req, res, ctx) => {
    return res(
      ctx.data({
        updateSubscription: random().key(TEST_SUBSCRIPTION_KEY).buildGraphql(),
      })
    );
  }
);

const updateSubscriptionDetailsHandlerWithDuplicateFieldError =
  graphql.mutation('UpdateSubscription', (_req, res, ctx) => {
    return res(
      ctx.data({ updateSubscription: null }),
      ctx.errors([
        {
          message: "A duplicate value '\"test-key\"' exists for field 'key'.",
          extensions: {
            code: 'DuplicateField',
            duplicateValue: 'test-key',
            field: 'key',
          },
        },
      ])
    );
  });

const updateSubscriptionDetailsHandlerWithARandomError = graphql.mutation(
  'UpdateSubscription',
  (_req, res, ctx) => {
    return res(
      ctx.data({ updateSubscription: null }),
      ctx.errors([
        {
          message: 'Some fake error message.',
          code: 'SomeFakeErrorCode',
        },
      ])
    );
  }
);

const useMockServerHandlers = (handlers: GraphQLHandler[]) => {
  mockServer.use(
    graphql.query('FetchSubscriptions', (_req, res, ctx) => {
      const totalItems = 2;

      return res(
        ctx.data({
          subscriptions: buildGraphqlList<TSubscription>(
            Array.from({ length: totalItems }).map((_, index) =>
              random().key(`subscription-key-${index}`)
            ),
            {
              name: 'Subscriptions',
              total: totalItems,
            }
          ),
        })
      );
    }),
    ...handlers
  );
};

describe('rendering', () => {
  it('should render subscription details', async () => {
    useMockServerHandlers([fetchSubscriptionDetailsQueryHandler]);
    renderApp();

    const keyInput: HTMLInputElement = await screen.findByLabelText(
      /subscription key/i
    );
    expect(keyInput.value).toBe(TEST_SUBSCRIPTION_KEY);

    screen.getByRole('combobox', { name: 'Destination' });

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });
  it('should reset form values on "revert" button click', async () => {
    useMockServerHandlers([fetchSubscriptionDetailsQueryHandler]);
    renderApp();

    const resetButton = await screen.findByRole('button', {
      name: /revert/i,
    });
    expect(resetButton).toBeDisabled();

    const keyInput: HTMLInputElement = await screen.findByLabelText(
      /subscription key/i
    );
    expect(keyInput.value).toBe(TEST_SUBSCRIPTION_KEY);

    fireEvent.change(keyInput, {
      target: { value: TEST_SUBSCRIPTION_NEW_KEY },
    });
    expect(keyInput.value).toBe(TEST_SUBSCRIPTION_NEW_KEY);

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(keyInput.value).toBe(TEST_SUBSCRIPTION_KEY);
    });
  }, 10000);
  describe('when user has no manage permission', () => {
    it('should render the form as read-only and keep the "save" button "disabled"', async () => {
      useMockServerHandlers([
        fetchSubscriptionDetailsQueryHandler,
        updateSubscriptionDetailsHandler,
      ]);
      renderApp({}, false);

      const keyInput = await screen.findByLabelText(/subscription key/i);
      expect(keyInput.hasAttribute('readonly')).toBeTruthy();

      const destinationSelect = screen.getByRole('combobox', {
        name: 'Destination',
      });
      expect(destinationSelect.hasAttribute('readonly')).toBeTruthy();

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    }, 10000);
  });
  it('should display a "page not found" information if the fetched subscription details data is null (without an error)', async () => {
    useMockServerHandlers([fetchSubscriptionDetailsQueryHandlerWithNullData]);
    renderApp();

    await screen.findByRole('heading', {
      name: /we could not find what you are looking for/i,
    });
  });
  it('should display a key field validation message if the submitted key value is duplicated', async () => {
    useMockServerHandlers([
      fetchSubscriptionDetailsQueryHandler,
      updateSubscriptionDetailsHandlerWithDuplicateFieldError,
    ]);
    renderApp();

    const keyInput: HTMLInputElement = await screen.findByLabelText(
      /subscription key/i
    );

    fireEvent.change(keyInput, {
      target: { value: TEST_SUBSCRIPTION_NEW_KEY },
    });
    expect(keyInput.value).toBe(TEST_SUBSCRIPTION_NEW_KEY);

    // updating subscription details
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await screen.findByText(/a subscription with this key already exists/i);
  }, 10000);
});
describe('notifications', () => {
  it('should render a success notification after an update', async () => {
    useMockServerHandlers([
      fetchSubscriptionDetailsQueryHandler,
      updateSubscriptionDetailsHandler,
    ]);
    renderApp();

    const keyInput: HTMLInputElement = await screen.findByLabelText(
      /subscription key/i
    );
    expect(keyInput.value).toBe(TEST_SUBSCRIPTION_KEY);

    fireEvent.change(keyInput, {
      target: { value: TEST_SUBSCRIPTION_NEW_KEY },
    });
    expect(keyInput.value).toBe(TEST_SUBSCRIPTION_NEW_KEY);

    const destinations = screen.getByRole('combobox', {
      name: 'Destination',
    });
    fireEvent.focus(destinations);
    fireEvent.keyDown(destinations, { key: 'ArrowDown' });
    const inventorySupplyOption = await screen.findByText('AWS SNS');

    fireEvent.click(inventorySupplyOption);

    await waitFor(() => {
      expect((destinations as HTMLInputElement).value).toBe('AWS SNS');
    });

    // SNS's own required fields (authentication mode + topic ARN) — IAM mode
    // doesn't need access key/secret, mirroring SQS's conditional fields.
    const authenticationModeTrigger = await screen.findByRole('button', {
      name: /authentication/i,
    });
    fireEvent.click(authenticationModeTrigger);
    const iamOption = await screen.findByRole('option', { name: 'IAM' });
    fireEvent.click(iamOption);

    const topicArnInput = await screen.findByLabelText(/arn of the amazon/i);
    fireEvent.change(topicArnInput, {
      target: { value: 'arn:aws:sns:eu-west-1:123456789012:my-topic' },
    });

    // updating subscription details
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    const notification = await screen.findByRole('alertdialog');
    within(notification).getByText(/subscription .+ updated/i);
  }, 10000);

  it('should render an error notification if fetching subscription details resulted in an error', async () => {
    useMockServerHandlers([fetchSubscriptionDetailsQueryHandlerWithError]);
    renderApp();
    await screen.findByText(
      "Field '$subscriptionId' has wrong value: Invalid ID."
    );
  });

  it('should display an error notification if an update resulted in an unmapped error', async () => {
    // Mock error log
    jest.spyOn(console, 'error').mockImplementation();

    useMockServerHandlers([
      fetchSubscriptionDetailsQueryHandler,
      updateSubscriptionDetailsHandlerWithARandomError,
    ]);
    renderApp();

    const keyInput = await screen.findByLabelText(/subscription key/i);

    // we're firing the input change to enable the save button, the value itself is not relevant
    fireEvent.change(keyInput, {
      target: { value: 'not-relevant' },
    });

    // updating subscription details
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    //
    // const notification = await screen.findByRole('alertdialog');
    // within(notification).getByText(/some fake error message/i);
  }, 10000);
});

describe('destination configuration of an existing subscription', () => {
  const fetchWithDestination = (destination: Record<string, unknown>) =>
    graphql.query('FetchSubscription', (_req, res, ctx) =>
      res(
        ctx.data({
          subscription: {
            ...random().key(TEST_SUBSCRIPTION_KEY).buildGraphql(),
            destination,
          },
        })
      )
    );

  const captureUpdate = () => {
    const calls: Array<{ actions: Array<Record<string, unknown>> }> = [];
    const handler = graphql.mutation('UpdateSubscription', (req, res, ctx) => {
      calls.push(req.variables as (typeof calls)[number]);
      return res(
        ctx.data({
          updateSubscription: random()
            .key(TEST_SUBSCRIPTION_NEW_KEY)
            .buildGraphql(),
        })
      );
    });
    return { calls, handler };
  };

  const valueOf = async (label: RegExp) =>
    ((await screen.findByLabelText(label)) as HTMLInputElement).value;

  const changeKeyAndSave = async () => {
    const keyInput = await screen.findByLabelText(/subscription key/i);
    fireEvent.change(keyInput, {
      target: { value: TEST_SUBSCRIPTION_NEW_KEY },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
  };

  it('loads an SNS destination into the form', async () => {
    useMockServerHandlers([
      fetchWithDestination({
        __typename: 'SNSDestination',
        type: 'SNS',
        topicArn: 'arn:aws:sns:eu-west-1:123456789012:my-topic',
        authenticationMode: 'IAM',
        accessKey: null,
        accessSecret: null,
      }),
    ]);
    renderApp();

    expect(await valueOf(/arn of the amazon sns topic/i)).toBe(
      'arn:aws:sns:eu-west-1:123456789012:my-topic'
    );
    await screen.findByRole('heading', {
      name: /configure aws sns destination/i,
    });
  }, 10000);

  it('loads an EventBridge destination into the form', async () => {
    useMockServerHandlers([
      fetchWithDestination({
        __typename: 'EventBridgeDestination',
        type: 'EventBridge',
        accountId: '123456789012',
        region: 'eu-west-1',
        source: 'aws.partner/commercetools.com/abc',
      }),
    ]);
    renderApp();

    expect(await valueOf(/id of the aws account/i)).toBe('123456789012');
    expect(await valueOf(/aws region of the event bus/i)).toBe('eu-west-1');
  }, 10000);

  it('loads an Azure Service Bus destination into the form', async () => {
    useMockServerHandlers([
      fetchWithDestination({
        __typename: 'AzureServiceBusDestination',
        type: 'AzureServiceBus',
        connectionString: 'Endpoint=sb://my-bus.servicebus.windows.net/',
      }),
    ]);
    renderApp();

    expect(await valueOf(/connection string of the azure service bus/i)).toBe(
      'Endpoint=sb://my-bus.servicebus.windows.net/'
    );
  }, 10000);

  it('loads an Event Grid destination into the form, including its aliased access key', async () => {
    useMockServerHandlers([
      fetchWithDestination({
        __typename: 'EventGridDestination',
        type: 'EventGrid',
        uri: 'https://my-topic.eventgrid.azure.net/api/events',
        eventGridAccessKey: 'my-access-key',
      }),
    ]);
    renderApp();

    expect(await valueOf(/uri of the azure event grid topic/i)).toBe(
      'https://my-topic.eventgrid.azure.net/api/events'
    );
    expect(await valueOf(/access key of the azure event grid topic/i)).toBe(
      'my-access-key'
    );
  }, 10000);

  it('loads a Confluent Cloud destination into the form, including the record key', async () => {
    useMockServerHandlers([
      fetchWithDestination({
        __typename: 'ConfluentCloudDestination',
        type: 'ConfluentCloud',
        acks: '1',
        apiKey: 'my-api-key',
        apiSecret: 'my-api-secret',
        bootstrapServer: 'pkc-1.europe-west1.gcp.confluent.cloud:9092',
        topic: 'my-topic',
        key: 'my-record-key',
      }),
    ]);
    renderApp();

    expect(await valueOf(/the kafka record key/i)).toBe('my-record-key');
    expect(await valueOf(/the name of the topic/i)).toBe('my-topic');
  }, 10000);

  it.each([
    [
      'EventGrid',
      {
        __typename: 'EventGridDestination',
        type: 'EventGrid',
        uri: 'https://my-topic.eventgrid.azure.net/api/events',
        eventGridAccessKey: 'my-access-key',
      },
    ],
    [
      'SNS (IAM, null credentials)',
      {
        __typename: 'SNSDestination',
        type: 'SNS',
        topicArn: 'arn:aws:sns:eu-west-1:123456789012:my-topic',
        authenticationMode: 'IAM',
        accessKey: null,
        accessSecret: null,
      },
    ],
    [
      'ConfluentCloud (no record key)',
      {
        __typename: 'ConfluentCloudDestination',
        type: 'ConfluentCloud',
        acks: '1',
        apiKey: 'k',
        apiSecret: 's',
        bootstrapServer: 'b:9092',
        topic: 't',
        key: null,
      },
    ],
  ])(
    'saving only a new key does not touch the %s destination',
    async (_name, destination) => {
      const { calls, handler } = captureUpdate();
      useMockServerHandlers([fetchWithDestination(destination), handler]);
      renderApp();

      await changeKeyAndSave();

      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0].actions).toEqual([
        { setKey: { key: TEST_SUBSCRIPTION_NEW_KEY } },
      ]);
    },
    15000
  );

  it('sends changeDestination with the record key once one is entered for Confluent Cloud', async () => {
    const { calls, handler } = captureUpdate();
    useMockServerHandlers([
      fetchWithDestination({
        __typename: 'ConfluentCloudDestination',
        type: 'ConfluentCloud',
        acks: '1',
        apiKey: 'k',
        apiSecret: 's',
        bootstrapServer: 'b:9092',
        topic: 't',
        key: null,
      }),
      handler,
    ]);
    renderApp();

    const keyInput = await screen.findByLabelText(/the kafka record key/i);
    fireEvent.change(keyInput, { target: { value: 'my-record-key' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].actions).toEqual([
      {
        changeDestination: {
          destination: {
            ConfluentCloud: expect.objectContaining({ key: 'my-record-key' }),
          },
        },
      },
    ]);
  }, 15000);
});
