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
});
