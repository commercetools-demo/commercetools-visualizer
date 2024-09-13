import { graphql, type GraphQLHandler } from 'msw';
import { setupServer } from 'msw/node';
import {
  fireEvent,
  screen,
  waitFor,
  mapResourceAccessToAppliedPermissions,
  type TRenderAppWithReduxOptions,
  within,
} from '@commercetools-frontend/application-shell/test-utils';
import { buildGraphqlList } from '@commercetools-test-data/core';
import { renderApplicationWithRoutesAndRedux } from '../../../test-utils';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import {
  random,
  TSubscription,
} from '../../../test-utils/models/subscriptions';
import { act, cleanup } from '@testing-library/react-hooks';

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

const renderApp = (
  options: Partial<TRenderAppWithReduxOptions> = {},
  includeManagePermissions = true
) => {
  const route =
    options.route ||
    `/my-project/${entryPointUriPath}/subscription/${TEST_SUBSCRIPTION_ID}`;
  const { history } = renderApplicationWithRoutesAndRedux({
    route,
    project: {
      allAppliedPermissions: mapResourceAccessToAppliedPermissions(
        [
          PERMISSIONS.View,
          includeManagePermissions ? PERMISSIONS.Manage : '',
        ].filter(Boolean)
      ),
    },
    ...options,
  });
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

    screen.getByRole('combobox', { name: 'Destination *' });

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
  });
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
        name: 'Destination *',
      });
      expect(destinationSelect.hasAttribute('readonly')).toBeTruthy();

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    }, 10000);
  });
  // it('should display a "page not found" information if the fetched subscription details data is null (without an error)', async () => {
  //   useMockServerHandlers([fetchSubscriptionDetailsQueryHandlerWithNullData]);
  //   renderApp();
  //
  //   await screen.findByRole('heading', {
  //     name: /we could not find what you are looking for/i,
  //   });
  // });
  // it('should display a key field validation message if the submitted key value is duplicated', async () => {
  //   useMockServerHandlers([
  //     fetchSubscriptionDetailsQueryHandler,
  //     updateSubscriptionDetailsHandlerWithDuplicateFieldError,
  //   ]);
  //   renderApp();
  //
  //   const keyInput: HTMLInputElement = await screen.findByLabelText(
  //     /subscription key/i
  //   );
  //
  //   fireEvent.change(keyInput, {
  //     target: { value: TEST_SUBSCRIPTION_NEW_KEY },
  //   });
  //   expect(keyInput.value).toBe(TEST_SUBSCRIPTION_NEW_KEY);
  //
  //   // updating subscription details
  //   const saveButton = screen.getByRole('button', { name: /save/i });
  //   fireEvent.click(saveButton);
  //
  //   await screen.findByText(/a subscription with this key already exists/i);
  // }, 10000);
});
// describe('notifications', () => {
//   it('should render a success notification after an update', async () => {
//     useMockServerHandlers([
//       fetchSubscriptionDetailsQueryHandler,
//       updateSubscriptionDetailsHandler,
//     ]);
//     renderApp();
//
//     const keyInput: HTMLInputElement = await screen.findByLabelText(
//       /subscription key/i
//     );
//     expect(keyInput.value).toBe(TEST_SUBSCRIPTION_KEY);
//
//     fireEvent.change(keyInput, {
//       target: { value: TEST_SUBSCRIPTION_NEW_KEY },
//     });
//     expect(keyInput.value).toBe(TEST_SUBSCRIPTION_NEW_KEY);
//
//     const destinations = screen.getByRole('combobox', {
//       name: 'Destination *',
//     });
//     fireEvent.focus(destinations);
//     fireEvent.keyDown(destinations, { key: 'ArrowDown' });
//     const inventorySupplyOption = await screen.findByText('AWS SNS');
//
//     act(() => {
//       inventorySupplyOption.click();
//     });
//
//     expect(screen.getByText(/AWS SNS/i)).toBeInTheDocument();
//
//     // updating subscription details
//     const saveButton = screen.getByRole('button', { name: /save/i });
//     fireEvent.click(saveButton);
//     const notification = await screen.findByRole('alertdialog');
//     within(notification).getByText(/subscription .+ updated/i);
//   }, 10000);
//
//   it('should render an error notification if fetching subscription details resulted in an error', async () => {
//     useMockServerHandlers([fetchSubscriptionDetailsQueryHandlerWithError]);
//     renderApp();
//     await screen.findByText(
//       "Field '$subscriptionId' has wrong value: Invalid ID."
//     );
//   });
//
//   it('should display an error notification if an update resulted in an unmapped error', async () => {
//     // Mock error log
//     jest.spyOn(console, 'error').mockImplementation();
//
//     useMockServerHandlers([
//       fetchSubscriptionDetailsQueryHandler,
//       updateSubscriptionDetailsHandlerWithARandomError,
//     ]);
//     renderApp();
//
//     const keyInput = await screen.findByLabelText(/subscription key/i);
//
//     // we're firing the input change to enable the save button, the value itself is not relevant
//     fireEvent.change(keyInput, {
//       target: { value: 'not-relevant' },
//     });
//
//     // updating subscription details
//     const saveButton = screen.getByRole('button', { name: /save/i });
//     fireEvent.click(saveButton);
//
//     const notification = await screen.findByRole('alertdialog');
//     within(notification).getByText(/some fake error message/i);
//   }, 8000);
// });
