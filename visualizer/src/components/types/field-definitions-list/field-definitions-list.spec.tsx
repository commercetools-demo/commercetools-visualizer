import { Route } from 'react-router-dom';
import {
  fireEvent,
  screen,
  within,
  mapResourceAccessToAppliedPermissions,
  renderAppWithRedux,
} from '@commercetools-frontend/application-shell/test-utils';
import { createApolloClient } from '@commercetools-frontend/application-shell';
import { NimbusProvider } from '@commercetools/nimbus';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import type { TFieldDefinition } from '../../../types/generated/ctp';
import {
  buildFieldDefinition,
  enumFieldType,
  localizedEnumFieldType,
  referenceFieldType,
  setFieldType,
  simpleFieldType,
} from '../../../test-utils/models/types';
import FieldDefinitionsList from './field-definitions-list';

// The create/edit routes are lazy-loaded; their own specs cover them. Stub
// them so navigation can be asserted without suspense/act noise.
jest.mock('../field-definition-create/field-definition-create', () => ({
  __esModule: true,
  default: () => <div>create-stub</div>,
}));
jest.mock('../field-definition-edit/field-definition-edit', () => ({
  __esModule: true,
  default: () => <div>edit-stub</div>,
}));

afterEach(async () => {
  await cleanup();
});

const TYPE_ID = 'b8a40b99-0c11-43bc-8680-fc570d624747';
const linkToHome = `/my-project/${entryPointUriPath}/types`;

const fieldDefinitions = (): Array<TFieldDefinition> =>
  [
    buildFieldDefinition('flag', simpleFieldType('Boolean'), {
      label: 'Flag label',
      required: true,
    }),
    buildFieldDefinition('title', simpleFieldType('String'), {
      label: 'Title label',
    }),
    buildFieldDefinition('localizedTitle', simpleFieldType('LocalizedString'), {
      label: 'Localized title label',
    }),
    buildFieldDefinition('quantity', simpleFieldType('Number'), {
      label: 'Quantity label',
    }),
    buildFieldDefinition('price', simpleFieldType('Money'), {
      label: 'Price label',
    }),
    buildFieldDefinition('day', simpleFieldType('Date'), {
      label: 'Day label',
    }),
    buildFieldDefinition('moment', simpleFieldType('DateTime'), {
      label: 'Moment label',
    }),
    buildFieldDefinition('clock', simpleFieldType('Time'), {
      label: 'Clock label',
    }),
    buildFieldDefinition('color', enumFieldType([{ key: 'r', label: 'Red' }]), {
      label: 'Color label',
    }),
    buildFieldDefinition(
      'localizedColor',
      localizedEnumFieldType([{ key: 'r', label: 'Red' }]),
      { label: 'Localized color label' }
    ),
    buildFieldDefinition('product', referenceFieldType('product'), {
      label: 'Product label',
    }),
    buildFieldDefinition('tags', setFieldType(simpleFieldType('String')), {
      label: 'Tags label',
    }),
    buildFieldDefinition(
      'categories',
      setFieldType(referenceFieldType('category')),
      {
        label: 'Categories label',
      }
    ),
  ].map((builder) => builder.buildGraphql<TFieldDefinition>());

const renderList = ({
  value = fieldDefinitions(),
  canManage = true,
  onRemoveFieldDefinition = jest.fn(),
}: {
  value?: Array<TFieldDefinition>;
  canManage?: boolean;
  onRemoveFieldDefinition?: (name: string) => void;
} = {}) => {
  const { history } = renderAppWithRedux(
    <Route path={`/:projectKey/${entryPointUriPath}/types/:id`}>
      <NimbusProvider locale="en" loadFonts={false}>
        <FieldDefinitionsList
          id={TYPE_ID}
          version={3}
          value={value}
          linkToHome={linkToHome}
          onRemoveFieldDefinition={onRemoveFieldDefinition}
        />
      </NimbusProvider>
    </Route>,
    {
      route: `${linkToHome}/${TYPE_ID}`,
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
  return { history, onRemoveFieldDefinition };
};

const rowFor = async (name: string) =>
  // eslint-disable-next-line testing-library/no-node-access
  (await screen.findByRole('rowheader', { name })).closest(
    '[role="row"]'
  ) as HTMLElement;

describe('FieldDefinitionsList', () => {
  it('renders the column headers', async () => {
    renderList();
    await screen.findByText('flag');
    for (const header of ['Name', 'Label', 'Required', 'Type', 'Set']) {
      expect(
        screen.getByRole('columnheader', { name: header })
      ).toBeInTheDocument();
    }
  });

  it('renders one row per field definition with its name and label', async () => {
    renderList();
    for (const field of fieldDefinitions()) {
      expect(await screen.findByText(field.name)).toBeInTheDocument();
    }
    expect(screen.getByText('Flag label')).toBeInTheDocument();
    expect(screen.getByText('Categories label')).toBeInTheDocument();
  });

  it.each([
    ['flag', /^Boolean$/],
    ['title', /^Text$/],
    ['quantity', /^Number$/],
    ['price', /^Money$/],
    ['day', /Date \/ Time \(Date\)/],
    ['moment', /Date \/ Time \(Date and Time\)/],
    ['clock', /Date \/ Time \(Time\)/],
    ['color', /List \(enum\)/],
    ['product', /Reference \(product\)/],
  ])('renders the type of %s', async (name, expected) => {
    renderList();
    const row = await rowFor(name);
    expect(within(row).getByText(expected)).toBeInTheDocument();
    expect(within(row).queryByText('Localized')).not.toBeInTheDocument();
  });

  it.each(['localizedTitle', 'localizedColor'])(
    'flags %s with a Localized badge',
    async (name) => {
      renderList();
      const row = await rowFor(name);
      expect(within(row).getByText('Localized')).toBeInTheDocument();
    }
  );

  it('renders a Set as its element type and marks the Set column', async () => {
    renderList();
    const tags = await rowFor('tags');
    expect(within(tags).getByText(/^Text$/)).toBeInTheDocument();
    expect(within(tags).getAllByLabelText('yes')).toHaveLength(1);

    const categories = await rowFor('categories');
    expect(
      within(categories).getByText(/Reference \(category\)/)
    ).toBeInTheDocument();
    expect(within(categories).getAllByLabelText('yes')).toHaveLength(1);
  });

  it('marks required fields with yes and others with no', async () => {
    renderList();
    const flag = await rowFor('flag');
    // required=yes, set=no
    expect(within(flag).getAllByLabelText('yes')).toHaveLength(1);
    expect(within(flag).getAllByLabelText('no')).toHaveLength(1);

    const title = await rowFor('title');
    expect(within(title).queryAllByLabelText('yes')).toHaveLength(0);
    expect(within(title).getAllByLabelText('no')).toHaveLength(2);
  });

  it('shows the empty state instead of a table when there are no fields', async () => {
    renderList({ value: [] });
    expect(await screen.findByText('Field Definitions')).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
  });

  it('calls onRemoveFieldDefinition with the field name', async () => {
    const { onRemoveFieldDefinition } = renderList();
    const row = await rowFor('price');
    fireEvent.click(
      within(row).getByRole('button', { name: 'Remove Field Definition' })
    );
    expect(onRemoveFieldDefinition).toHaveBeenCalledTimes(1);
    expect(onRemoveFieldDefinition).toHaveBeenCalledWith('price');
  });

  it('navigates to the "new field" route from the add button', async () => {
    const { history } = renderList();
    fireEvent.click(
      await screen.findByRole('button', { name: /add field definition/i })
    );
    expect(history.location.pathname).toBe(`${linkToHome}/${TYPE_ID}/3/new`);
    expect(await screen.findByText('create-stub')).toBeInTheDocument();
  });

  it('navigates to the field when its row is clicked', async () => {
    const { history } = renderList();
    await userEvent.click(await rowFor('quantity'));
    expect(await screen.findByText('edit-stub')).toBeInTheDocument();
    expect(history.location.pathname).toBe(`${linkToHome}/${TYPE_ID}/quantity`);
  });

  describe('without the Manage permission', () => {
    it('disables the add button and every remove button', async () => {
      renderList({ canManage: false });
      expect(
        await screen.findByRole('button', { name: /add field definition/i })
      ).toBeDisabled();
      const removeButtons = screen.getAllByRole('button', {
        name: 'Remove Field Definition',
      });
      expect(removeButtons).toHaveLength(fieldDefinitions().length);
      removeButtons.forEach((button) => expect(button).toBeDisabled());
    });

    it('does not call onRemoveFieldDefinition', async () => {
      const { onRemoveFieldDefinition } = renderList({ canManage: false });
      const row = await rowFor('price');
      fireEvent.click(
        within(row).getByRole('button', { name: 'Remove Field Definition' })
      );
      expect(onRemoveFieldDefinition).not.toHaveBeenCalled();
    });
  });
});
