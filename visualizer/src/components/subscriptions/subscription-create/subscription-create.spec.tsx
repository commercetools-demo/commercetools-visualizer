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
import SubscriptionCreate from './subscription-create';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';

const mockServer = setupServer();
afterEach(async () => {
  mockServer.resetHandlers();
  await cleanup();
});
beforeAll(() => {
  mockServer.listen({
    onUnhandledRequest: 'error',
  });
});
afterAll(() => {
  mockServer.close();
});

const TEST_SUBSCRIPTION_KEY = 'new-subscription-key';

// `SubscriptionCreate` is rendered in isolation (rather than via
// `<ApplicationRoutes />`) so the test does not transitively import unrelated
// routes. `NimbusProvider` is normally supplied once by `EntryPoint`, which
// isn't rendered here, so it's added explicitly.
const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route =
    options.route || `/my-project/${entryPointUriPath}/subscription/new`;
  const { history } = renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/subscription/new`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <SubscriptionCreate
          linkToWelcome={`/my-project/${entryPointUriPath}`}
        />
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
  return { history };
};

const createSubscriptionHandler = graphql.mutation(
  'CreateSubscription',
  (_req, res, ctx) => {
    return res(
      ctx.data({
        createSubscription: { id: 'newly-created-subscription-id' },
      })
    );
  }
);

describe('rendering', () => {
  it('should render all subscription sections on a single page', async () => {
    renderApp();

    await screen.findByLabelText(/subscription key/i);
    screen.getByRole('combobox', { name: 'Destination' });
    screen.getByText('Changes');
    screen.getByText('Messages');

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    expect(screen.queryByText(/select provider/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/configure provider/i)).not.toBeInTheDocument();
  });
});

describe('message and change options', () => {
  it('offers a message group for every resource type the API allows, and none it rejects', async () => {
    renderApp();
    await screen.findByLabelText(/subscription key/i);

    [
      'Approval Flow',
      'Customer Email Token',
      'Customer Group',
      'Customer Password Token',
      'Shopping List',
      'Variant',
    ].forEach((label) =>
      expect(
        screen.getByText(
          new RegExp(`messages related to type ${label} \\(`, 'i')
        )
      ).toBeInTheDocument()
    );
    ['Cart Discount', 'Discount Code', 'Recurring Order'].forEach((label) =>
      expect(
        screen.queryByText(
          new RegExp(`messages related to type ${label} \\(`, 'i')
        )
      ).not.toBeInTheDocument()
    );
  });

  it('offers the newer change resource types', async () => {
    renderApp();
    await screen.findByLabelText(/subscription key/i);
    fireEvent.click(screen.getByRole('button', { name: 'Changes' }));

    [
      'discount-group',
      'recurrence-policy',
      'recurring-order',
      'variant',
    ].forEach((type) =>
      expect(
        screen.getByRole('checkbox', {
          name: new RegExp(`changes related to ${type}`, 'i'),
        })
      ).toBeInTheDocument()
    );
  });
});

describe('creating a subscription', () => {
  it('should not submit and should keep the user on the create page while required fields are missing', async () => {
    mockServer.use(createSubscriptionHandler);
    const { history } = renderApp();

    await screen.findByLabelText(/subscription key/i);

    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe(
        `/my-project/${entryPointUriPath}/subscription/new`
      );
    });
  }, 10000);

  it('should create a subscription and navigate back to the subscriptions list once all required fields are filled in', async () => {
    mockServer.use(createSubscriptionHandler);
    const { history } = renderApp();

    const keyInput: HTMLInputElement = await screen.findByLabelText(
      /subscription key/i
    );
    fireEvent.change(keyInput, {
      target: { value: TEST_SUBSCRIPTION_KEY },
    });
    expect(keyInput.value).toBe(TEST_SUBSCRIPTION_KEY);

    const destinationCombobox = screen.getByRole('combobox', {
      name: 'Destination',
    });
    fireEvent.change(destinationCombobox, {
      target: { value: 'Google Cloud Pub/Sub' },
    });
    const option = await screen.findByRole('option', {
      name: 'Google Cloud Pub/Sub',
    });
    fireEvent.click(option);

    const topicInput = await screen.findByLabelText(/name of the topic/i);
    fireEvent.change(topicInput, { target: { value: 'my-topic' } });
    const projectIdInput = await screen.findByLabelText(
      /google cloud project/i
    );
    fireEvent.change(projectIdInput, { target: { value: 'my-project' } });

    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe(
        `/my-project/${entryPointUriPath}/subscriptions/`
      );
    });
  }, 10000);

  describe('with a Confluent Cloud destination', () => {
    const fillAndCreate = async (recordKey?: string) => {
      const calls: Array<{ draft: { destination: Record<string, unknown> } }> =
        [];
      mockServer.use(
        graphql.mutation('CreateSubscription', (req, res, ctx) => {
          calls.push(req.variables as (typeof calls)[number]);
          return res(
            ctx.data({ createSubscription: { id: 'newly-created-id' } })
          );
        })
      );
      renderApp();

      fireEvent.change(await screen.findByLabelText(/subscription key/i), {
        target: { value: TEST_SUBSCRIPTION_KEY },
      });
      fireEvent.change(screen.getByRole('combobox', { name: 'Destination' }), {
        target: { value: 'Confluent Cloud' },
      });
      fireEvent.click(
        await screen.findByRole('option', { name: 'Confluent Cloud' })
      );

      fireEvent.change(
        await screen.findByLabelText(/url to the bootstrap server/i),
        {
          target: { value: 'pkc-1.europe-west1.gcp.confluent.cloud:9092' },
        }
      );
      fireEvent.change(screen.getByLabelText(/api key to be used/i), {
        target: { value: 'my-api-key' },
      });
      fireEvent.change(screen.getByLabelText(/api secret to be used/i), {
        target: { value: 'my-api-secret' },
      });
      fireEvent.change(screen.getByLabelText(/the name of the topic/i), {
        target: { value: 'my-topic' },
      });
      fireEvent.click(screen.getByLabelText(/the kafka acks value/i));
      fireEvent.click(await screen.findByRole('option', { name: 'all' }));
      if (recordKey !== undefined) {
        fireEvent.change(screen.getByLabelText(/the kafka record key/i), {
          target: { value: recordKey },
        });
      }

      fireEvent.click(screen.getByRole('button', { name: /create/i }));
      await waitFor(() => expect(calls).toHaveLength(1));
      return calls[0];
    };

    it('offers an optional record key field', async () => {
      renderApp();
      fireEvent.change(
        await screen.findByRole('combobox', { name: 'Destination' }),
        { target: { value: 'Confluent Cloud' } }
      );
      fireEvent.click(
        await screen.findByRole('option', { name: 'Confluent Cloud' })
      );
      const keyInput = await screen.findByLabelText(/the kafka record key/i);
      expect(keyInput).not.toBeRequired();
    }, 10000);

    it('sends the record key when one is entered', async () => {
      const call = await fillAndCreate('my-record-key');
      expect(JSON.stringify(call)).toContain('"key":"my-record-key"');
    }, 20000);

    it('leaves the record key out when it is not entered', async () => {
      const call = await fillAndCreate();
      const confluent = JSON.stringify(call);
      expect(confluent).toContain('my-api-key');
      expect(confluent).not.toContain('"key":""');
      expect(confluent).not.toMatch(/"key":null/);
    }, 20000);
  });
});
