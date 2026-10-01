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
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import { buildTypeDefinition } from '../../../test-utils/models/types';
import TypesCreate from './types-create';

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

const onClose = jest.fn();
const onCreate = jest.fn();
beforeEach(() => {
  onClose.mockReset();
  onCreate.mockReset();
});

const renderApp = (
  options: Partial<TRenderAppWithReduxOptions> = {},
  includeManagePermissions = true
) => {
  const route = options.route || `/my-project/${entryPointUriPath}/types/new`;
  return renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/types/new`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <TypesCreate
          linkToHome={`/my-project/${entryPointUriPath}/types`}
          onClose={onClose}
          onCreate={onCreate}
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
};

const keyInput = () => screen.findByLabelText(/type key/i);
const saveButton = () => screen.getByRole('button', { name: /save/i });

const typeKey = async (value: string) => {
  const input = await keyInput();
  fireEvent.change(input, { target: { value } });
  return input;
};
const typeName = async (value: string) => {
  const nameInput = (await waitFor(() => {
    // eslint-disable-next-line testing-library/no-node-access
    const el = document.getElementById('types-edit-name.en');
    if (!el) throw new Error('name input not rendered');
    return el;
  })) as HTMLInputElement;
  fireEvent.change(nameInput, { target: { value } });
  return nameInput;
};

describe('rendering', () => {
  it('renders an empty, editable form with a disabled save button', async () => {
    renderApp();

    const key = (await keyInput()) as HTMLInputElement;
    expect(key.value).toBe('');
    expect(key.hasAttribute('readonly')).toBe(false);
    expect(
      screen.getByRole('heading', { name: /create a type/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('does not render the field-definitions list while creating', async () => {
    renderApp();
    await keyInput();
    expect(
      screen.queryByRole('button', { name: /add field/i })
    ).not.toBeInTheDocument();
  });

  it('enables save once the form is dirty', async () => {
    renderApp();
    await typeKey('my-new-type');
    await waitFor(() => expect(saveButton()).toBeEnabled());
  });

  it('calls onClose when cancel is pressed', async () => {
    renderApp();
    await keyInput();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

describe('without manage permission', () => {
  it('renders read-only fields and keeps save disabled', async () => {
    renderApp({}, false);

    const key = await keyInput();
    expect(key.hasAttribute('readonly')).toBe(true);
    const resourceTypeIds = await screen.findByLabelText(/resource type ids/i);
    expect(resourceTypeIds.hasAttribute('readonly')).toBe(true);
    expect(saveButton()).toBeDisabled();
  });
});

describe('validation', () => {
  it('shows a required error for a missing key after blur', async () => {
    renderApp();
    const key = await typeKey('x');
    await typeKey('');
    fireEvent.blur(key);
    await screen.findByText(/this field is required/i);
  });

  it.each(['a', 'has space', 'ünïcode', 'bad#key', 'x'.repeat(257)])(
    'shows the key-format error for the invalid key %p',
    async (invalid) => {
      renderApp();
      const key = await typeKey(invalid);
      fireEvent.blur(key);
      await screen.findByText(/key must contain between 2 and 256/i);
    }
  );

  it('accepts a valid key without showing an error', async () => {
    renderApp();
    const key = await typeKey('valid_key-1');
    fireEvent.blur(key);
    await waitFor(() => expect(key).toHaveValue('valid_key-1'));
    expect(
      screen.queryByText(/key must contain between 2 and 256/i)
    ).not.toBeInTheDocument();
  });

  it('shows a required error for the name after blur', async () => {
    renderApp();
    await typeKey('valid-key');
    const name = await typeName('x');
    await typeName('');
    fireEvent.blur(name);
    await waitFor(() =>
      expect(
        screen.getAllByText(/this field is required/i).length
      ).toBeGreaterThan(0)
    );
  });

  it('does not submit an invalid form', async () => {
    const createSpy = jest.fn();
    mockServer.use(
      graphql.mutation('CreateTypeDefinition', (_req, res, ctx) => {
        createSpy();
        return res(ctx.data({ createTypeDefinition: { id: 'x' } }));
      })
    );
    renderApp();
    await typeKey('only-a-key');
    await waitFor(() => expect(saveButton()).toBeEnabled());
    fireEvent.click(saveButton());

    // name and resource types are still missing
    await waitFor(() =>
      expect(
        screen.getAllByText(/this field is required/i).length
      ).toBeGreaterThan(0)
    );
    expect(createSpy).not.toHaveBeenCalled();
    expect(onCreate).not.toHaveBeenCalled();
  });
});

describe('submitting', () => {
  const fillValidForm = async () => {
    await typeKey('my-new-type');
    await typeName('My new type');
    const combo = await screen.findByLabelText(/resource type ids/i);
    fireEvent.focus(combo);
    fireEvent.change(combo, { target: { value: 'customer' } });
    const option = await screen.findByRole('option', { name: 'customer' });
    fireEvent.click(option);
  };

  it('sends the draft with omitted empty translations and calls onCreate with the new id', async () => {
    const created = buildTypeDefinition({ key: 'my-new-type' });
    let variables: Record<string, unknown> | undefined;
    mockServer.use(
      graphql.mutation('CreateTypeDefinition', (req, res, ctx) => {
        variables = req.variables;
        return res(ctx.data({ createTypeDefinition: { id: created.id } }));
      })
    );
    renderApp();
    await fillValidForm();

    await waitFor(() => expect(saveButton()).toBeEnabled());
    fireEvent.click(saveButton());

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith(created.id));
    const draft = (variables as { draft: Record<string, unknown> }).draft;
    expect(draft.key).toBe('my-new-type');
    expect(draft.resourceTypeIds).toEqual(['customer']);
    expect(draft.name).toEqual([{ locale: 'en', value: 'My new type' }]);
    // description was left blank, so it is sent without any translation
    expect(draft.description).toEqual([]);
  });

  it('shows a success notification', async () => {
    const created = buildTypeDefinition();
    mockServer.use(
      graphql.mutation('CreateTypeDefinition', (_req, res, ctx) =>
        res(ctx.data({ createTypeDefinition: { id: created.id } }))
      )
    );
    renderApp();
    await fillValidForm();
    await waitFor(() => expect(saveButton()).toBeEnabled());
    fireEvent.click(saveButton());

    await screen.findByText(/your custom type has been created/i);
  });

  it('shows an API error as a notification and does not call onCreate', async () => {
    mockServer.use(
      graphql.mutation('CreateTypeDefinition', (_req, res, ctx) =>
        res(
          ctx.errors([
            {
              message: 'A type with key "my-new-type" already exists.',
              extensions: { code: 'DuplicateField', field: 'key' },
            },
          ])
        )
      )
    );
    renderApp();
    await fillValidForm();
    await waitFor(() => expect(saveButton()).toBeEnabled());
    fireEvent.click(saveButton());

    await screen.findByText(/already exists/i);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('shows a generic API error as a notification', async () => {
    mockServer.use(
      graphql.mutation('CreateTypeDefinition', (_req, res, ctx) =>
        res(
          ctx.errors([
            { message: 'Boom', extensions: { code: 'InvalidInput' } },
          ])
        )
      )
    );
    renderApp();
    await fillValidForm();
    await waitFor(() => expect(saveButton()).toBeEnabled());
    fireEvent.click(saveButton());

    await screen.findByText(/boom/i);
    expect(onCreate).not.toHaveBeenCalled();
  });
});
