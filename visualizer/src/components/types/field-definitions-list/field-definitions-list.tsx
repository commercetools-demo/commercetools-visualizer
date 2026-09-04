import { FC, lazy } from 'react';
import { useIntl } from 'react-intl';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { ApolloQueryResult } from '@apollo/client';
import {
  Box,
  Button,
  DataTable,
  Flex,
  IconButton,
  Stack,
  Text,
  type DataTableColumnItem,
} from '@commercetools/nimbus';
import { Add, Check, Close, Delete } from '@commercetools/nimbus-icons';
import {
  TFieldDefinition,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TTypeUpdateAction,
} from '../../../types/generated/ctp';
import messages from './messages';
import { useTypeDefinitionUpdater } from '../../../hooks';
import { renderAttributeTypeName } from './render-attribute-type-name';
import { PERMISSIONS } from '../../../constants';
import { formatLocalizedString } from '../../../utils/format-localized-string';

const NewFieldDefinitionInput = lazy(
  () => import('../field-definition-create/field-definition-create')
);
const FieldDefinitionInput = lazy(
  () => import('../field-definition-edit/field-definition-edit')
);

type Props = {
  id: string;
  version: number;
  value: Array<TFieldDefinition>;
  linkToHome: string;
  refetch?: (
    variables?: Partial<TQuery_TypeDefinitionArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

type TFieldDefinitionWithId = { id: string } & TFieldDefinition;

const BooleanCell = ({ value }: { value: boolean }) =>
  value ? (
    <Box color="primary.9" aria-label="yes">
      <Check />
    </Box>
  ) : (
    <Box color="neutral.9" aria-label="no">
      <Close />
    </Box>
  );

const FieldDefinitionsList: FC<Props> = ({
  id,
  value,
  refetch,
  linkToHome,
  version,
}) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const typeDefinitionUpdater = useTypeDefinitionUpdater();
  const showNotification = useShowNotification();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const fields: Array<TFieldDefinitionWithId> = value.map((item, index) => ({
    ...item,
    id: index + '',
  }));

  const deleteItem = async (name: string) => {
    const deleteAction: TTypeUpdateAction = {
      removeFieldDefinition: { fieldName: name },
    };
    await typeDefinitionUpdater.execute({
      actions: [deleteAction],
      id: id,
      version: version,
    });
    showNotification({
      kind: 'success',
      domain: DOMAINS.SIDE,
      text: intl.formatMessage(messages.removeFieldDefinitionButtonSuccess),
    });
    refetch && (await refetch());
  };

  const columns: Array<DataTableColumnItem<TFieldDefinitionWithId>> = [
    {
      id: 'name',
      header: intl.formatMessage(messages.columnFieldName),
      isRowHeader: true,
      accessor: (row) => row.name,
    },
    {
      id: 'label',
      header: intl.formatMessage(messages.columnFieldLabel),
      accessor: (row) =>
        formatLocalizedString(
          row.labelAllLocales,
          dataLocale,
          projectLanguages
        ),
    },
    {
      id: 'required',
      header: intl.formatMessage(messages.columnFieldRequired),
      accessor: (row) => row.required,
      render: ({ value: required }) => (
        <BooleanCell value={Boolean(required)} />
      ),
    },
    {
      id: 'type',
      header: intl.formatMessage(messages.columnFieldType),
      accessor: (row) => row.type,
      render: ({ value: type }) => renderAttributeTypeName(type),
    },
    {
      id: 'set',
      header: intl.formatMessage(messages.columnFieldSet),
      accessor: (row) => row.type?.name === 'Set',
      render: ({ value: isSet }) => <BooleanCell value={Boolean(isSet)} />,
    },
    {
      id: 'delete',
      header: '',
      isSortable: false,
      accessor: (row) => row.name,
      render: ({ value: name }) => (
        <IconButton
          aria-label={intl.formatMessage(messages.removeFieldDefinitionButton)}
          size="xs"
          variant="ghost"
          isDisabled={!canManage}
          onPress={() => deleteItem(name as string)}
        >
          <Delete />
        </IconButton>
      ),
    },
  ];

  return (
    <Stack direction="column" gap="400">
      <Flex justifyContent="flex-end">
        <Button
          variant="outline"
          colorPalette="primary"
          isDisabled={!canManage}
          onPress={() => push(`${linkToHome}/${id}/${version}/new`)}
        >
          <Add />
          {intl.formatMessage(messages.addField)}
        </Button>
      </Flex>
      {fields.length === 0 ? (
        <Text color="neutral.11">
          {intl.formatMessage(messages.fieldHeaderTitle)}
        </Text>
      ) : (
        <DataTable<TFieldDefinitionWithId>
          columns={columns}
          rows={fields}
          onRowClick={(row) => push(`${match.url}/${row.name}`)}
        />
      )}
      <Switch>
        <SuspendedRoute path={`${linkToHome}/:id/:version/new`}>
          <NewFieldDefinitionInput
            onClose={async () => {
              refetch && (await refetch());
              push(`${match.url}`);
            }}
          />
        </SuspendedRoute>
        <SuspendedRoute path={`${linkToHome}/:id/:fieldDefinitionName`}>
          <FieldDefinitionInput
            onClose={async () => {
              refetch && (await refetch());
              push(`${match.url}`);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </Stack>
  );
};

FieldDefinitionsList.displayName = 'FieldTable';

export default FieldDefinitionsList;
