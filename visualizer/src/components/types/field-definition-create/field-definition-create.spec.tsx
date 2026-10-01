import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import { Route } from 'react-router-dom';
import {
  screen,
  waitFor,
  within,
  mapResourceAccessToAppliedPermissions,
  renderAppWithRedux,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { NimbusProvider } from '@commercetools/nimbus';
import { act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import { buildTypeDefinition } from '../../../test-utils/models/types';
import FieldDefinitionCreate from './field-definition-create';

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

const TEST_TYPE_ID = 'b8a40b99-0c11-43bc-8680-fc570d624747';

// `FieldDefinitionCreate` does not fetch on mount (it submits an
// `addFieldDefinition` action), so it can be rendered in isolation, wrapped in
// a `Route` that provides the `:id`/`:version` params. `NimbusProvider` is
// normally supplied once by `EntryPoint`, which isn't rendered here, so it's
// added explicitly.
const renderApp = (
  options: Partial<TRenderAppWithReduxOptions> = {},
  { canManage = true, onClose = jest.fn() } = {}
) => {
  const route =
    options.route ||
    `/my-project/${entryPointUriPath}/types/${TEST_TYPE_ID}/1/new`;
  return renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/types/:id/:version/new`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <FieldDefinitionCreate onClose={onClose} />
      </NimbusProvider>
    </Route>,
    {
      route,
      environment: { entryPointUriPath },
      apolloClient: createApolloClient(),
      project: {
        allAppliedPermissions: mapResourceAccessToAppliedPermissions(
          [PERMISSIONS.View, canManage ? PERMISSIONS.Manage : ''].filter(
            Boolean
          )
        ),
      },
      ...options,
    }
  );
};

it('should render the field-definition create form', async () => {
  renderApp();

  // Name + Label + Type fields render (Name is editable in create mode).
  const nameInput = await screen.findByLabelText(/field name/i);
  expect(nameInput).toBeInTheDocument();
  expect(nameInput.hasAttribute('readonly')).toBeFalsy();

  expect(
    screen.getByRole('button', { name: /create field definition/i })
  ).toBeInTheDocument();

  // The submit button is disabled until the form is dirty.
  expect(
    screen.getByRole('button', { name: /create field definition/i })
  ).toBeDisabled();
});

// --- helpers ---------------------------------------------------------------

type UpdateCall = {
  id: string;
  version: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: Array<{ addFieldDefinition: { fieldDefinition: any } }>;
};

const captureUpdate = () => {
  const calls: Array<UpdateCall> = [];
  const handler = graphql.mutation('UpdateTypeDefinition', (req, res, ctx) => {
    calls.push(req.variables as UpdateCall);
    return res(
      ctx.data({
        updateTypeDefinition: buildTypeDefinition({
          id: TEST_TYPE_ID,
          version: 2,
        }),
      })
    );
  });
  return { calls, handler };
};

const chooseOption = async (triggerName: RegExp, optionName: string) => {
  const trigger = await screen.findByRole('button', { name: triggerName });
  act(() => trigger.focus());
  await userEvent.keyboard('{Enter}');
  const listbox = await screen.findByRole('listbox');
  await userEvent.click(
    within(listbox).getByRole('option', { name: optionName })
  );
};

const chooseType = (optionName: string) =>
  chooseOption(/select an item type/i, optionName);

const typeName = async (name: string) =>
  userEvent.type(await screen.findByLabelText(/field name/i), name);

// The LocalizedField input has no aria-label of its own; its stable handle is
// the id Nimbus derives from the field id + locale.
const labelInput = async () => {
  await screen.findByLabelText(/field name/i);
  // eslint-disable-next-line testing-library/no-node-access
  return document.getElementById('field-definition-label.en') as HTMLElement;
};

const typeLabel = async (label: string) =>
  userEvent.type(await labelInput(), label);

const checkbox = (name: RegExp) => screen.getByRole('checkbox', { name });

const submit = async () => {
  const button = screen.getByRole('button', {
    name: /create field definition/i,
  });
  await waitFor(() => expect(button).toBeEnabled());
  await userEvent.click(button);
};

const fillBasics = async (name = 'my-field', label = 'My label') => {
  await typeName(name);
  await typeLabel(label);
};

const sentField = async (calls: Array<UpdateCall>) => {
  await waitFor(() => expect(calls).toHaveLength(1));
  expect(calls[0].actions).toHaveLength(1);
  return calls[0].actions[0].addFieldDefinition.fieldDefinition;
};

// --- creating a field definition per type ----------------------------------

describe('creating a field definition', () => {
  it('sends addFieldDefinition with the type id and version from the route, then notifies and closes', async () => {
    const { calls, handler } = captureUpdate();
    const onClose = jest.fn();
    mockServer.use(handler);
    renderApp({}, { onClose });

    await fillBasics('my-field', 'My label');
    await chooseType('Yes / No (boolean)');
    await submit();

    const field = await sentField(calls);
    expect(calls[0].id).toBe(TEST_TYPE_ID);
    expect(calls[0].version).toBe(1);
    expect(field).toEqual({
      name: 'my-field',
      required: false,
      inputHint: 'SingleLine',
      type: { Boolean: {} },
      label: [{ locale: 'en', value: 'My label' }],
    });
    await screen.findByText('Field Definition updated');
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it.each([
    ['Number', { Number: {} }],
    ['Money', { Money: {} }],
    ['Text', { String: {} }],
  ])('creates a %s field', async (optionName, expectedType) => {
    const { calls, handler } = captureUpdate();
    mockServer.use(handler);
    renderApp();

    await fillBasics();
    await chooseType(optionName);
    await submit();

    expect((await sentField(calls)).type).toEqual(expectedType);
  });

  it('creates a localized Text field via the Localized checkbox', async () => {
    const { calls, handler } = captureUpdate();
    mockServer.use(handler);
    renderApp();

    await fillBasics();
    await chooseType('Text');
    await userEvent.click(checkbox(/localized/i));
    await submit();

    expect((await sentField(calls)).type).toEqual({ LocalizedString: {} });
  });

  it('maps the multi-line checkbox of a Text field to the MultiLine input hint', async () => {
    const { calls, handler } = captureUpdate();
    mockServer.use(handler);
    renderApp();

    await fillBasics();
    await chooseType('Text');
    await userEvent.click(checkbox(/input hint|multi/i));
    await submit();

    expect((await sentField(calls)).inputHint).toBe('MultiLine');
  });

  it.each([
    ['Date', { Date: {} }],
    ['Time', { Time: {} }],
    ['Date and Time', { DateTime: {} }],
  ])(
    'creates a Date/Time field with the %s format',
    async (format, expectedType) => {
      const { calls, handler } = captureUpdate();
      mockServer.use(handler);
      renderApp();

      await fillBasics();
      await chooseType('Date/Time');
      await userEvent.click(screen.getByRole('radio', { name: format }));
      await submit();

      expect((await sentField(calls)).type).toEqual(expectedType);
    }
  );

  it('creates a Reference field with the chosen reference type', async () => {
    const { calls, handler } = captureUpdate();
    mockServer.use(handler);
    renderApp();

    await fillBasics();
    await chooseType('Reference');
    await chooseOption(/select an item reference type/i, 'product');
    await submit();

    expect((await sentField(calls)).type).toEqual({
      Reference: { referenceTypeId: 'product' },
    });
  });

  it('creates a required field', async () => {
    const { calls, handler } = captureUpdate();
    mockServer.use(handler);
    renderApp();

    await fillBasics();
    await chooseType('Number');
    await userEvent.click(checkbox(/required/i));
    await submit();

    expect((await sentField(calls)).required).toBe(true);
  });

  it('wraps the type in a Set when "Create a set" is checked', async () => {
    const { calls, handler } = captureUpdate();
    mockServer.use(handler);
    renderApp();

    await fillBasics();
    await chooseType('Number');
    await userEvent.click(checkbox(/create a set/i));
    await submit();

    expect((await sentField(calls)).type).toEqual({
      Set: { elementType: { Number: {} } },
    });
  });

  it('creates a Set of References', async () => {
    const { calls, handler } = captureUpdate();
    mockServer.use(handler);
    renderApp();

    await fillBasics();
    await chooseType('Reference');
    await chooseOption(/select an item reference type/i, 'category');
    await userEvent.click(checkbox(/create a set/i));
    await submit();

    expect((await sentField(calls)).type).toEqual({
      Set: { elementType: { Reference: { referenceTypeId: 'category' } } },
    });
  });

  it('does not allow a required field to be a Set', async () => {
    renderApp();

    await fillBasics();
    await chooseType('Number');
    await userEvent.click(checkbox(/required/i));

    expect(checkbox(/create a set/i)).toBeDisabled();
    expect(
      screen.getByText(/set cannot be required|cannot be required/i)
    ).toBeInTheDocument();
  });

  describe('Enum', () => {
    // Labels deliberately start with their row's key ("Red" for `red`): typing
    // them used to lose focus to the list's type-ahead mid-word.
    const addEnumValue = async (index: number, key: string, label: string) => {
      await userEvent.type(await screen.findByLabelText(`key-${index}`), key);
      await userEvent.type(
        await screen.findByLabelText(`label-${index}`),
        label
      );
    };

    it('creates a List (enum) with its values, dropping blank rows', async () => {
      const { calls, handler } = captureUpdate();
      mockServer.use(handler);
      renderApp();

      await fillBasics();
      await chooseType('List (enum)');
      await addEnumValue(0, 'red', 'Red');
      await userEvent.click(
        screen.getByRole('button', { name: 'Add New List Item' })
      );
      await addEnumValue(1, 'green', 'Green');
      // A third, blank row must not be sent.
      await userEvent.click(
        screen.getByRole('button', { name: 'Add New List Item' })
      );
      await submit();

      expect((await sentField(calls)).type).toEqual({
        Enum: {
          values: [
            { key: 'red', label: 'Red' },
            { key: 'green', label: 'Green' },
          ],
        },
      });
    });

    it('creates a localized List with one label per language', async () => {
      const { calls, handler } = captureUpdate();
      mockServer.use(handler);
      renderApp();

      await fillBasics();
      await chooseType('List (enum)');
      await userEvent.click(checkbox(/localized/i));
      await userEvent.type(await screen.findByLabelText('key-0'), 'red');
      await userEvent.type(await screen.findByLabelText('label_en-0'), 'Red');
      await submit();

      expect((await sentField(calls)).type).toEqual({
        LocalizedEnum: {
          values: [{ key: 'red', label: [{ locale: 'en', value: 'Red' }] }],
        },
      });
    });

    it('creates a Set of Enum values', async () => {
      const { calls, handler } = captureUpdate();
      mockServer.use(handler);
      renderApp();

      await fillBasics();
      await chooseType('List (enum)');
      await addEnumValue(0, 'red', 'Red');
      await userEvent.click(checkbox(/create a set/i));
      await submit();

      expect((await sentField(calls)).type).toEqual({
        Set: {
          elementType: { Enum: { values: [{ key: 'red', label: 'Red' }] } },
        },
      });
    });

    it('removes an enum value before sending', async () => {
      const { calls, handler } = captureUpdate();
      mockServer.use(handler);
      renderApp();

      await fillBasics();
      await chooseType('List (enum)');
      await addEnumValue(0, 'red', 'Red');
      await userEvent.click(
        screen.getByRole('button', { name: 'Add New List Item' })
      );
      await addEnumValue(1, 'green', 'Green');
      await userEvent.click(
        screen.getAllByRole('button', { name: 'Remove List Item' })[0]
      );
      await submit();

      expect((await sentField(calls)).type).toEqual({
        Enum: { values: [{ key: 'green', label: 'Green' }] },
      });
    });
  });
});

// --- validation -----------------------------------------------------------

describe('validation', () => {
  const mutationSpy = () => {
    const { calls, handler } = captureUpdate();
    mockServer.use(handler);
    return calls;
  };

  it('flags an empty name as required once touched', async () => {
    renderApp();
    const name = await screen.findByLabelText(/field name/i);
    await userEvent.click(name);
    await userEvent.tab();
    expect(
      await screen.findByText(
        /this field is required\. provide at least one value/i
      )
    ).toBeInTheDocument();
  });

  it.each([
    ['a', 'too short'],
    ['has space', 'a space'],
    ['ünïcode', 'non-ascii characters'],
    ['semi;colon', 'special characters'],
    ['x'.repeat(257), 'longer than 256 characters'],
  ])('rejects the name %p (%s)', async (value) => {
    renderApp();
    const name = await screen.findByLabelText(/field name/i);
    await userEvent.type(name, value);
    await userEvent.tab();
    expect(
      await screen.findByText(/^key must contain between 2 and 256/i)
    ).toBeInTheDocument();
  });

  it.each(['ab', 'my-field', 'my_field', 'Field123', 'x'.repeat(256)])(
    'accepts the name %p',
    async (value) => {
      renderApp();
      const name = await screen.findByLabelText(/field name/i);
      await userEvent.click(name);
      await userEvent.paste(value);
      await userEvent.tab();
      await waitFor(() =>
        expect(
          screen.queryByText(/^key must contain between 2 and 256/i)
        ).not.toBeInTheDocument()
      );
      expect(
        screen.queryByText(
          /this field is required\. provide at least one value/i
        )
      ).not.toBeInTheDocument();
    }
  );

  it('flags an empty label as required once touched', async () => {
    renderApp();
    const label = await labelInput();
    await userEvent.click(label);
    await userEvent.tab();
    expect(
      await screen.findByText(/this field is required\. provide a value/i)
    ).toBeInTheDocument();
  });

  it('does not submit while the type is missing', async () => {
    const calls = mutationSpy();
    renderApp();

    await fillBasics();
    await submit();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(calls).toHaveLength(0);
  });

  it('requires a reference type when the type is Reference', async () => {
    const calls = mutationSpy();
    renderApp();

    await fillBasics();
    await chooseType('Reference');
    await submit();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(calls).toHaveLength(0);
    expect(
      await screen.findByText(/this field is required\. provide a value/i)
    ).toBeInTheDocument();
  });

  it('does not submit an invalid name', async () => {
    const calls = mutationSpy();
    renderApp();

    await fillBasics('bad name');
    await chooseType('Number');
    await submit();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(calls).toHaveLength(0);
  });

  it('keeps the create button disabled until something was entered', async () => {
    renderApp();
    expect(
      await screen.findByRole('button', { name: /create field definition/i })
    ).toBeDisabled();
  });
});

// --- failures & permissions -----------------------------------------------

describe('failures', () => {
  it('shows an error notification and does not close when the API rejects the update', async () => {
    const onClose = jest.fn();
    mockServer.use(
      graphql.mutation('UpdateTypeDefinition', (_req, res, ctx) =>
        res(ctx.errors([{ message: 'Duplicate field name boom' }]))
      )
    );
    renderApp({}, { onClose });

    await fillBasics();
    await chooseType('Number');
    await submit();

    await screen.findByText(/Duplicate field name boom/);
    expect(
      screen.queryByText('Field Definition updated')
    ).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('without the Manage permission', () => {
  it('renders the inputs read-only and keeps the create button disabled', async () => {
    renderApp({}, { canManage: false });

    const name = await screen.findByLabelText(/field name/i);
    expect(name.hasAttribute('readonly')).toBe(true);
    expect(
      screen.getByRole('button', { name: /create field definition/i })
    ).toBeDisabled();
  });
});
