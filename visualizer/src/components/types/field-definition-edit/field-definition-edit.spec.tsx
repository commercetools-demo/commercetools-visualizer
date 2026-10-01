import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import { Route } from 'react-router-dom';
import {
  screen,
  waitFor,
  mapResourceAccessToAppliedPermissions,
  renderAppWithRedux,
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { NimbusProvider } from '@commercetools/nimbus';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import {
  buildFieldDefinition,
  buildTypeDefinition,
  enumFieldType,
  localizedEnumFieldType,
  referenceFieldType,
  setFieldType,
  simpleFieldType,
} from '../../../test-utils/models/types';
import FieldDefinitionEdit from './field-definition-edit';

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
const TYPE_VERSION = 7;

type FieldBuilder = ReturnType<typeof buildFieldDefinition>;

// `FieldDefinitionEdit` is rendered in isolation, wrapped in a `Route` that
// provides `:id`/`:fieldDefinitionName`. `NimbusProvider` is normally supplied
// once by `EntryPoint`, which isn't rendered here, so it's added explicitly.
const renderEdit = ({
  fieldName,
  canManage = true,
  onClose = jest.fn(),
}: {
  fieldName: string;
  canManage?: boolean;
  onClose?: () => void;
}) =>
  renderAppWithRedux(
    <Route
      path={`/:projectKey/${entryPointUriPath}/types/:id/:fieldDefinitionName`}
    >
      <NimbusProvider locale="en" loadFonts={false}>
        <FieldDefinitionEdit onClose={onClose} />
      </NimbusProvider>
    </Route>,
    {
      route: `/my-project/${entryPointUriPath}/types/${TEST_TYPE_ID}/${fieldName}`,
      environment: { entryPointUriPath },
      apolloClient: createApolloClient(),
      project: {
        allAppliedPermissions: mapResourceAccessToAppliedPermissions(
          [PERMISSIONS.View, canManage ? PERMISSIONS.Manage : ''].filter(
            Boolean
          )
        ),
      },
    }
  );

const fetchHandler = (field: FieldBuilder | null) =>
  graphql.query('FetchTypeWithDefinitionByName', (_req, res, ctx) =>
    res(
      ctx.data({
        typeDefinition: field
          ? buildTypeDefinition({
              id: TEST_TYPE_ID,
              version: TYPE_VERSION,
              fieldDefinitions: [field],
            })
          : null,
      })
    )
  );

type UpdateCall = {
  id: string;
  version: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: Array<Record<string, any>>;
};
const captureUpdate = () => {
  const calls: Array<UpdateCall> = [];
  const handler = graphql.mutation('UpdateTypeDefinition', (req, res, ctx) => {
    calls.push(req.variables);
    return res(
      ctx.data({
        updateTypeDefinition: buildTypeDefinition({
          id: TEST_TYPE_ID,
          version: TYPE_VERSION + 1,
        }),
      })
    );
  });
  return { calls, handler };
};

const labelInput = async () => {
  await screen.findByLabelText(/field name/i);
  // eslint-disable-next-line testing-library/no-node-access
  return document.getElementById(
    'field-definition-label.en'
  ) as HTMLInputElement;
};

const updateButton = () =>
  screen.getByRole('button', { name: /update field definition/i });

const saveChanges = async () => {
  await waitFor(() => expect(updateButton()).toBeEnabled());
  await userEvent.click(updateButton());
};

describe('rendering an existing field definition', () => {
  it('shows name, label and the immutable settings of a simple field as disabled', async () => {
    mockServer.use(
      fetchHandler(
        buildFieldDefinition('my-number', simpleFieldType('Number'), {
          label: 'My number label',
          required: true,
        })
      )
    );
    renderEdit({ fieldName: 'my-number' });

    const name = (await screen.findByLabelText(
      /field name/i
    )) as HTMLInputElement;
    expect(name.value).toBe('my-number');
    expect(name).toBeDisabled();
    expect((await labelInput()).value).toBe('My number label');
    const typeSelect = screen.getByRole('button', { name: /number/i });
    expect(typeSelect).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /required/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /required/i })).toBeDisabled();
  });

  it('shows a non-required field as unchecked', async () => {
    mockServer.use(
      fetchHandler(buildFieldDefinition('optional', simpleFieldType('Number')))
    );
    renderEdit({ fieldName: 'optional' });

    await screen.findByLabelText(/field name/i);
    expect(
      screen.getByRole('checkbox', { name: /required/i })
    ).not.toBeChecked();
  });

  it('keeps the update button disabled until something changed', async () => {
    mockServer.use(
      fetchHandler(buildFieldDefinition('my-number', simpleFieldType('Number')))
    );
    renderEdit({ fieldName: 'my-number' });

    await screen.findByLabelText(/field name/i);
    expect(updateButton()).toBeDisabled();
  });

  it('shows a Set checkbox as checked for a Set field, with its element type', async () => {
    mockServer.use(
      fetchHandler(
        buildFieldDefinition('tags', setFieldType(simpleFieldType('Number')))
      )
    );
    renderEdit({ fieldName: 'tags' });

    await screen.findByLabelText(/field name/i);
    expect(
      screen.getByRole('checkbox', { name: /create a set/i })
    ).toBeChecked();
    expect(screen.getByRole('button', { name: /number/i })).toBeDisabled();
  });

  it('shows the reference type of a Reference field', async () => {
    mockServer.use(
      fetchHandler(buildFieldDefinition('ref', referenceFieldType('product')))
    );
    renderEdit({ fieldName: 'ref' });

    await screen.findByLabelText(/field name/i);
    const referenceSelect = screen.getByRole('button', { name: /product/i });
    expect(referenceSelect).toBeDisabled();
  });

  it('shows a localized Text field with the Localized checkbox checked', async () => {
    mockServer.use(
      fetchHandler(
        buildFieldDefinition('title', simpleFieldType('LocalizedString'))
      )
    );
    renderEdit({ fieldName: 'title' });

    await screen.findByLabelText(/field name/i);
    expect(screen.getByRole('checkbox', { name: /localized/i })).toBeChecked();
  });

  it('shows the multi-line input hint of a Text field', async () => {
    mockServer.use(
      fetchHandler(
        buildFieldDefinition('notes', simpleFieldType('String'), {
          inputHint: 'MultiLine',
        })
      )
    );
    renderEdit({ fieldName: 'notes' });

    await screen.findByLabelText(/field name/i);
    const multiLine = screen.getByRole('checkbox', {
      name: /input hint|multi/i,
    });
    expect(multiLine).toBeChecked();
    // The input hint is immutable after create, so it can't be edited here.
    expect(multiLine).toBeDisabled();
  });

  it('lists the values of an Enum field', async () => {
    mockServer.use(
      fetchHandler(
        buildFieldDefinition(
          'color',
          enumFieldType([
            { key: 'red', label: 'Red' },
            { key: 'green', label: 'Green' },
          ])
        )
      )
    );
    renderEdit({ fieldName: 'color' });

    expect(
      ((await screen.findByLabelText('key-0')) as HTMLInputElement).value
    ).toBe('red');
    expect((screen.getByLabelText('label-0') as HTMLInputElement).value).toBe(
      'Red'
    );
    expect((screen.getByLabelText('key-1') as HTMLInputElement).value).toBe(
      'green'
    );
    expect((screen.getByLabelText('label-1') as HTMLInputElement).value).toBe(
      'Green'
    );
  });

  it('lists the per-language labels of a LocalizedEnum field', async () => {
    mockServer.use(
      fetchHandler(
        buildFieldDefinition(
          'color',
          localizedEnumFieldType([{ key: 'red', label: 'Red', de: 'Rot' }])
        )
      )
    );
    renderEdit({ fieldName: 'color' });

    await screen.findByLabelText('key-0');
    expect(screen.getByRole('checkbox', { name: /localized/i })).toBeChecked();
    expect(
      (screen.getByLabelText('label_en-0') as HTMLInputElement).value
    ).toBe('Red');
  });

  it('shows page-not-found when the field does not exist on the type', async () => {
    mockServer.use(fetchHandler(null));
    renderEdit({ fieldName: 'missing' });

    await screen.findByRole('heading', {
      name: /we could not find what you are looking for/i,
    });
  });

  it('renders an alert with the error message when fetching fails', async () => {
    mockServer.use(
      graphql.query('FetchTypeWithDefinitionByName', (_req, res, ctx) =>
        res(ctx.errors([{ message: 'Field fetch exploded' }]))
      )
    );
    renderEdit({ fieldName: 'whatever' });

    expect(await screen.findByText(/Field fetch exploded/)).toBeInTheDocument();
  });
});

describe('updating a field definition', () => {
  it('sends changeLabel with the type id and fetched version, then notifies', async () => {
    const { calls, handler } = captureUpdate();
    mockServer.use(
      fetchHandler(
        buildFieldDefinition('my-number', simpleFieldType('Number'), {
          label: 'Old label',
        })
      ),
      handler,
      // The edit flow refetches after a successful update.
      fetchHandler(
        buildFieldDefinition('my-number', simpleFieldType('Number'), {
          label: 'New label',
        })
      )
    );
    renderEdit({ fieldName: 'my-number' });

    const label = await labelInput();
    await userEvent.clear(label);
    await userEvent.type(label, 'New label');
    await saveChanges();

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].id).toBe(TEST_TYPE_ID);
    expect(calls[0].version).toBe(TYPE_VERSION);
    expect(calls[0].actions).toHaveLength(1);
    expect(calls[0].actions[0]).toHaveProperty('changeLabel');
    expect(calls[0].actions[0].changeLabel.fieldName).toBe('my-number');
    expect(calls[0].actions[0].changeLabel.label).toContainEqual({
      locale: 'en',
      value: 'New label',
    });
    await screen.findByText('Field Definition updated');
  });

  it('sends no mutation when the label is changed and changed back', async () => {
    const { calls, handler } = captureUpdate();
    mockServer.use(
      fetchHandler(
        buildFieldDefinition('my-number', simpleFieldType('Number'), {
          label: 'Old label',
        })
      ),
      handler
    );
    renderEdit({ fieldName: 'my-number' });

    const label = await labelInput();
    await userEvent.type(label, 'x');
    await userEvent.type(label, '{backspace}');
    await waitFor(() => expect(updateButton()).toBeDisabled());
    expect(calls).toHaveLength(0);
  });

  it('shows an error and no success when the update fails', async () => {
    mockServer.use(
      fetchHandler(
        buildFieldDefinition('my-number', simpleFieldType('Number'), {
          label: 'Old label',
        })
      ),
      graphql.mutation('UpdateTypeDefinition', (_req, res, ctx) =>
        res(ctx.errors([{ message: 'Concurrent modification boom' }]))
      )
    );
    renderEdit({ fieldName: 'my-number' });

    await userEvent.type(await labelInput(), 'x');
    await saveChanges();

    await screen.findByText(/Concurrent modification boom/);
    expect(
      screen.queryByText('Field Definition updated')
    ).not.toBeInTheDocument();
  });

  describe('Enum values', () => {
    const colorField = () =>
      buildFieldDefinition(
        'color',
        enumFieldType([
          { key: 'red', label: 'Red' },
          { key: 'green', label: 'Green' },
        ])
      );

    it('adds a value with addEnumValue', async () => {
      const { calls, handler } = captureUpdate();
      mockServer.use(
        fetchHandler(colorField()),
        handler,
        fetchHandler(colorField())
      );
      renderEdit({ fieldName: 'color' });

      await screen.findByLabelText('key-0');
      await userEvent.click(
        screen.getByRole('button', { name: 'Add New List Item' })
      );
      await userEvent.type(await screen.findByLabelText('key-2'), 'blue');
      await userEvent.type(screen.getByLabelText('label-2'), 'Blue');
      await saveChanges();

      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0].actions).toEqual([
        {
          addEnumValue: {
            fieldName: 'color',
            value: { key: 'blue', label: 'Blue' },
          },
        },
      ]);
    });

    it('relabels a value with changeEnumValueLabel', async () => {
      const { calls, handler } = captureUpdate();
      mockServer.use(
        fetchHandler(colorField()),
        handler,
        fetchHandler(colorField())
      );
      renderEdit({ fieldName: 'color' });

      const label = await screen.findByLabelText('label-0');
      await userEvent.clear(label);
      await userEvent.type(label, 'Crimson');
      await saveChanges();

      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0].actions).toHaveLength(1);
      expect(JSON.stringify(calls[0].actions[0])).toContain('Crimson');
      expect(Object.keys(calls[0].actions[0])[0]).toMatch(
        /changeEnumValueLabel/
      );
    });

    it('removes a value with removeEnumValues', async () => {
      const { calls, handler } = captureUpdate();
      mockServer.use(
        fetchHandler(colorField()),
        handler,
        fetchHandler(colorField())
      );
      renderEdit({ fieldName: 'color' });

      await screen.findByLabelText('key-0');
      await userEvent.click(
        screen.getAllByRole('button', { name: 'Remove List Item' })[1]
      );
      await saveChanges();

      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0].actions).toEqual([
        { removeEnumValues: { fieldName: 'color', keys: ['green'] } },
      ]);
    });

    it('removes a non-last value with only removeEnumValues (no spurious add)', async () => {
      const { calls, handler } = captureUpdate();
      mockServer.use(
        fetchHandler(colorField()),
        handler,
        fetchHandler(colorField())
      );
      renderEdit({ fieldName: 'color' });

      await screen.findByLabelText('key-0');
      await userEvent.click(
        screen.getAllByRole('button', { name: 'Remove List Item' })[0]
      );
      await saveChanges();

      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0].actions).toEqual([
        { removeEnumValues: { fieldName: 'color', keys: ['red'] } },
      ]);
    });

    it('removes a value from a LocalizedEnum with removeLocalizedEnumValues', async () => {
      const localizedField = () =>
        buildFieldDefinition(
          'color',
          localizedEnumFieldType([
            { key: 'red', label: 'Red' },
            { key: 'green', label: 'Green' },
          ])
        );
      const { calls, handler } = captureUpdate();
      mockServer.use(
        fetchHandler(localizedField()),
        handler,
        fetchHandler(localizedField())
      );
      renderEdit({ fieldName: 'color' });

      await screen.findByLabelText('key-0');
      await userEvent.click(
        screen.getAllByRole('button', { name: 'Remove List Item' })[0]
      );
      await saveChanges();

      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0].actions).toEqual([
        { removeLocalizedEnumValues: { fieldName: 'color', keys: ['red'] } },
      ]);
    });
  });
});

describe('without the Manage permission', () => {
  it('keeps the label read-only and the update button disabled', async () => {
    mockServer.use(
      fetchHandler(
        buildFieldDefinition('my-number', simpleFieldType('Number'), {
          label: 'Old label',
        })
      )
    );
    renderEdit({ fieldName: 'my-number', canManage: false });

    const label = await labelInput();
    expect(label.hasAttribute('readonly')).toBe(true);
    expect(updateButton()).toBeDisabled();
  });

  it('disables the enum value inputs and buttons', async () => {
    mockServer.use(
      fetchHandler(
        buildFieldDefinition(
          'color',
          enumFieldType([
            { key: 'red', label: 'Red' },
            { key: 'green', label: 'Green' },
          ])
        )
      )
    );
    renderEdit({ fieldName: 'color', canManage: false });

    expect(await screen.findByLabelText('key-0')).toBeDisabled();
    expect(screen.getByLabelText('label-0')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Add New List Item' })
    ).toBeDisabled();
    screen
      .getAllByRole('button', { name: 'Remove List Item' })
      .forEach((button) => expect(button).toBeDisabled());
  });
});
