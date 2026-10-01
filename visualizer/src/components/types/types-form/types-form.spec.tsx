import { Route } from 'react-router-dom';
import {
  fireEvent,
  screen,
  waitFor,
  within,
  mapResourceAccessToAppliedPermissions,
  renderAppWithRedux,
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { NimbusProvider } from '@commercetools/nimbus';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import {
  buildFieldDefinition,
  buildTypeDefinition,
  simpleFieldType,
} from '../../../test-utils/models/types';
import TypesForm, { type TFormValues } from './types-form';

const baseType = buildTypeDefinition({
  id: 'type-1',
  key: 'existing-type',
  version: 3,
  name: 'Existing name',
  description: 'Existing description',
  resourceTypeIds: ['customer', 'order'],
  fieldDefinitions: [
    buildFieldDefinition('first-field', simpleFieldType('String'), {
      label: 'First label',
      required: true,
    }),
    buildFieldDefinition('second-field', simpleFieldType('Boolean'), {
      label: 'Second label',
    }),
  ],
});

const initialValues: TFormValues = {
  id: baseType.id,
  key: baseType.key,
  name: { en: 'Existing name' },
  description: { en: 'Existing description' },
  resourceTypeIds: baseType.resourceTypeIds,
  fieldDefinitions: baseType.fieldDefinitions,
};

const onSubmit = jest.fn();
beforeEach(() => onSubmit.mockReset());

const renderForm = ({
  createNewMode = false,
  manage = true,
  values = initialValues,
}: {
  createNewMode?: boolean;
  manage?: boolean;
  values?: TFormValues;
} = {}) => {
  let formProps: Parameters<
    React.ComponentProps<typeof TypesForm>['children']
  >[0];
  renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/types`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <TypesForm
          initialValues={values}
          onSubmit={onSubmit}
          linkToHome={`/my-project/${entryPointUriPath}/types`}
          version={3}
          createNewMode={createNewMode}
        >
          {(props) => {
            formProps = props;
            return (
              <div>
                {props.formElements}
                <button onClick={props.handleReset}>reset</button>
                <button onClick={() => props.submitForm()}>submit</button>
                <span data-testid="dirty">{String(props.isDirty)}</span>
              </div>
            );
          }}
        </TypesForm>
      </NimbusProvider>
    </Route>,
    {
      route: `/my-project/${entryPointUriPath}/types`,
      environment: { entryPointUriPath },
      apolloClient: createApolloClient(),
      project: {
        allAppliedPermissions: mapResourceAccessToAppliedPermissions(
          [PERMISSIONS.View, manage ? PERMISSIONS.Manage : ''].filter(Boolean)
        ),
      },
    }
  );
  return { getFormProps: () => formProps };
};

const nameInput = () =>
  document.getElementById('types-edit-name.en') as HTMLInputElement;

describe('edit mode', () => {
  it('renders the initial values', async () => {
    renderForm();

    expect(
      ((await screen.findByLabelText(/type key/i)) as HTMLInputElement).value
    ).toBe('existing-type');
    expect(nameInput().value).toBe('Existing name');
    expect(
      (document.getElementById('types-edit-description.en') as HTMLInputElement)
        .value
    ).toBe('Existing description');
  });

  it('keeps key and resource type ids read-only', async () => {
    renderForm();
    expect(
      (await screen.findByLabelText(/type key/i)).hasAttribute('readonly')
    ).toBe(true);
    expect(
      screen.getByLabelText(/resource type ids/i).hasAttribute('readonly')
    ).toBe(true);
  });

  it('shows the selected resource types as tags', async () => {
    renderForm();
    await screen.findByLabelText(/type key/i);
    expect(screen.getByText('customer')).toBeInTheDocument();
    expect(screen.getByText('order')).toBeInTheDocument();
  });

  it('renders the field definitions list with one row per field', async () => {
    renderForm();
    expect(await screen.findByText('first-field')).toBeInTheDocument();
    expect(screen.getByText('second-field')).toBeInTheDocument();
    expect(screen.getByText('First label')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add field/i })
    ).toBeInTheDocument();
  });

  it('is not dirty initially and becomes dirty after an edit', async () => {
    renderForm();
    await screen.findByLabelText(/type key/i);
    expect(screen.getByTestId('dirty')).toHaveTextContent('false');

    fireEvent.change(nameInput(), { target: { value: 'Changed' } });
    await waitFor(() =>
      expect(screen.getByTestId('dirty')).toHaveTextContent('true')
    );
  });

  it('restores the initial values on reset', async () => {
    renderForm();
    await screen.findByLabelText(/type key/i);
    fireEvent.change(nameInput(), { target: { value: 'Changed' } });
    await waitFor(() => expect(nameInput().value).toBe('Changed'));

    fireEvent.click(screen.getByText('reset'));
    await waitFor(() => expect(nameInput().value).toBe('Existing name'));
    expect(screen.getByTestId('dirty')).toHaveTextContent('false');
  });

  it('removes a field definition from the form values and marks it dirty', async () => {
    const { getFormProps } = renderForm();
    await screen.findByText('first-field');

    const row = screen.getByText('first-field').closest('tr') as HTMLElement;
    fireEvent.click(
      within(row).getByRole('button', { name: /remove field definition/i })
    );

    await waitFor(() =>
      expect(screen.queryByText('first-field')).not.toBeInTheDocument()
    );
    expect(screen.getByText('second-field')).toBeInTheDocument();
    expect(
      getFormProps().values.fieldDefinitions.map(
        (f: { name: string }) => f.name
      )
    ).toEqual(['second-field']);
    expect(screen.getByTestId('dirty')).toHaveTextContent('true');
  });

  it('submits the current values when valid', async () => {
    renderForm();
    await screen.findByLabelText(/type key/i);
    fireEvent.change(nameInput(), { target: { value: 'Changed' } });
    fireEvent.click(screen.getByText('submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      key: 'existing-type',
      name: { en: 'Changed' },
      resourceTypeIds: ['customer', 'order'],
    });
  });

  it('does not submit when the name has been emptied', async () => {
    renderForm();
    await screen.findByLabelText(/type key/i);
    fireEvent.change(nameInput(), { target: { value: '' } });
    fireEvent.click(screen.getByText('submit'));

    await waitFor(() =>
      expect(
        screen.getAllByText(/this field is required/i).length
      ).toBeGreaterThan(0)
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('create mode', () => {
  const empty: TFormValues = {
    id: '',
    key: '',
    name: { en: '' },
    description: { en: '' },
    resourceTypeIds: [],
    fieldDefinitions: [],
  };

  it('makes key and resource type ids editable and hides the field list', async () => {
    renderForm({ createNewMode: true, values: empty });

    expect(
      (await screen.findByLabelText(/type key/i)).hasAttribute('readonly')
    ).toBe(false);
    expect(
      screen.getByLabelText(/resource type ids/i).hasAttribute('readonly')
    ).toBe(false);
    expect(
      screen.queryByRole('button', { name: /add field/i })
    ).not.toBeInTheDocument();
  });

  it('shows required errors for key, name and resource types on submit', async () => {
    renderForm({ createNewMode: true, values: empty });
    await screen.findByLabelText(/type key/i);
    fireEvent.click(screen.getByText('submit'));
    // submitting touches all fields, so every required error is rendered
    await waitFor(() =>
      expect(
        screen.getAllByText(/this field is required/i).length
      ).toBeGreaterThanOrEqual(2)
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('without manage permission', () => {
  it('makes every field read-only and disables the field list actions', async () => {
    renderForm({ manage: false });

    expect(
      (await screen.findByLabelText(/type key/i)).hasAttribute('readonly')
    ).toBe(true);
    expect(nameInput().hasAttribute('readonly')).toBe(true);
    expect(
      (
        document.getElementById('types-edit-description.en') as HTMLInputElement
      ).hasAttribute('readonly')
    ).toBe(true);
    expect(screen.getByRole('button', { name: /add field/i })).toBeDisabled();
    screen
      .getAllByRole('button', { name: /remove field definition/i })
      .forEach((b) => expect(b).toBeDisabled());
  });
});
