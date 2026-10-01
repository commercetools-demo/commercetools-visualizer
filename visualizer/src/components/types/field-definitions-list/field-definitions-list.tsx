import { FC, lazy } from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
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
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Check,
  Close,
  Delete,
} from '@commercetools/nimbus-icons';
import {
  TFieldDefinition,
  TQuery,
  TQuery_TypeDefinitionArgs,
} from '../../../types/generated/ctp';
import messages from './messages';
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
  onRemoveFieldDefinition: (name: string) => void;
  // Moves a field one position; the new order is staged in the type form until Save.
  onMoveFieldDefinition?: (name: string, direction: 'up' | 'down') => void;
  refetch?: (
    variables?: Partial<TQuery_TypeDefinitionArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

type TFieldDefinitionWithId = { id: string } & TFieldDefinition;

const BooleanCell = ({ value, intl }: { value: boolean; intl: IntlShape }) =>
  value ? (
    <Box color="primary.9" aria-label={intl.formatMessage(messages.booleanYes)}>
      <Check />
    </Box>
  ) : (
    <Box color="neutral.9" aria-label={intl.formatMessage(messages.booleanNo)}>
      <Close />
    </Box>
  );

const FieldDefinitionsList: FC<Props> = ({
  id,
  value,
  refetch,
  linkToHome,
  version,
  onRemoveFieldDefinition,
  onMoveFieldDefinition,
}) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
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
      accessor: (row) => (
        <BooleanCell value={Boolean(row.required)} intl={intl} />
      ),
    },
    {
      id: 'type',
      header: intl.formatMessage(messages.columnFieldType),
      accessor: (row) => renderAttributeTypeName(row.type),
    },
    {
      id: 'set',
      header: intl.formatMessage(messages.columnFieldSet),
      accessor: (row) => (
        <BooleanCell value={row.type?.name === 'Set'} intl={intl} />
      ),
    },
    ...(onMoveFieldDefinition
      ? [
          {
            id: 'move',
            header: '',
            isSortable: false,
            accessor: (row: TFieldDefinitionWithId) => {
              const index = Number(row.id);
              return (
                <Flex gap="100">
                  <IconButton
                    aria-label={intl.formatMessage(messages.moveFieldUp, {
                      name: row.name,
                    })}
                    size="xs"
                    variant="ghost"
                    isDisabled={!canManage || index === 0}
                    onPress={() => onMoveFieldDefinition(row.name, 'up')}
                  >
                    <ArrowUpward />
                  </IconButton>
                  <IconButton
                    aria-label={intl.formatMessage(messages.moveFieldDown, {
                      name: row.name,
                    })}
                    size="xs"
                    variant="ghost"
                    isDisabled={!canManage || index === fields.length - 1}
                    onPress={() => onMoveFieldDefinition(row.name, 'down')}
                  >
                    <ArrowDownward />
                  </IconButton>
                </Flex>
              );
            },
          },
        ]
      : []),
    {
      id: 'delete',
      header: '',
      isSortable: false,
      accessor: (row) => (
        <IconButton
          aria-label={intl.formatMessage(messages.removeFieldDefinitionButton)}
          size="xs"
          variant="ghost"
          isDisabled={!canManage}
          onPress={() => onRemoveFieldDefinition(row.name)}
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
