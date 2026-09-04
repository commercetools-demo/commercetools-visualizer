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
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { NimbusProvider } from '@commercetools/nimbus';
import { cleanup } from '@testing-library/react';
import { Type } from '@commercetools-test-data/type';
import { TTypeGraphql } from '@commercetools-test-data/type/dist/declarations/src/type/types';
import { LocalizedString } from '@commercetools-test-data/commons';
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
  includeManagePermissions = true
) => {
  const route =
    options.route || `/my-project/${entryPointUriPath}/types/${TEST_TYPE_ID}`;
  const { history } = renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/types/:id`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <TypesEdit
          linkToHome={`/my-project/${entryPointUriPath}/types`}
          onClose={jest.fn()}
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
