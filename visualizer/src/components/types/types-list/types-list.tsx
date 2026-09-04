import { FC, lazy, useState } from 'react';
import { useIntl } from 'react-intl';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import {
  Alert,
  Button,
  DataTable,
  DefaultPage,
  Flex,
  LoadingSpinner,
  Pagination,
  Text,
  type SortDescriptor,
} from '@commercetools/nimbus';
import { Add } from '@commercetools/nimbus-icons';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { getErrorMessage, useTypeDefinitionsFetcher } from '../../../hooks';
import { TTypeDefinition } from '../../../types/generated/ctp';
import { PERMISSIONS } from '../../../constants';
import messages from './messages';
import createColumnDefinitions from './column-definitions';

const TypesCreate = lazy(() => import('../types-create/types-create'));
const TypesEdit = lazy(() => import('../types-edit/types-edit'));

const DEFAULT_PER_PAGE = 20;

const toSortString = (sortDescriptor: SortDescriptor): string =>
  `${String(sortDescriptor.column)} ${
    sortDescriptor.direction === 'descending' ? 'desc' : 'asc'
  }`;

type Props = {};

const TypesList: FC<Props> = () => {
  const intl = useIntl();
  const { push } = useHistory();
  const match = useRouteMatch();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'key',
    direction: 'ascending',
  });

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const { typeDefinitions, error, loading, refetch } =
    useTypeDefinitionsFetcher({
      limit: perPage,
      offset: (page - 1) * perPage,
      sort: [toSortString(sortDescriptor)],
    });

  const total = typeDefinitions?.total ?? 0;
  const results = (typeDefinitions?.results ?? []) as Array<TTypeDefinition>;

  return (
    <DefaultPage.Root>
      <DefaultPage.Header>
        <DefaultPage.Title>
          {intl.formatMessage(messages.title)}
        </DefaultPage.Title>
        <DefaultPage.Actions>
          <Button
            variant="outline"
            colorPalette="primary"
            isDisabled={!canManage}
            onPress={() => push(`${match.url}/new`)}
          >
            <Add />
            {intl.formatMessage(messages.addType)}
          </Button>
        </DefaultPage.Actions>
      </DefaultPage.Header>
      <DefaultPage.Content>
        {error ? (
          <Alert.Root colorPalette="critical">
            <Alert.Title>{intl.formatMessage(messages.title)}</Alert.Title>
            <Alert.Description>{getErrorMessage(error)}</Alert.Description>
          </Alert.Root>
        ) : loading ? (
          <Flex justifyContent="center" padding="600">
            <LoadingSpinner aria-label={intl.formatMessage(messages.title)} />
          </Flex>
        ) : total === 0 ? (
          <Text color="neutral.11">
            {intl.formatMessage(messages.noResults)}
          </Text>
        ) : (
          <Flex direction="column" gap="400">
            <DataTable<TTypeDefinition>
              columns={createColumnDefinitions({
                intl,
                dataLocale,
                projectLanguages,
              })}
              rows={results}
              allowsSorting
              sortDescriptor={sortDescriptor}
              onSortChange={(descriptor) => {
                setSortDescriptor(descriptor);
                setPage(1);
              }}
              onRowClick={(row) => push(`${match.url}/${row.id}`)}
            />
            <Pagination
              totalItems={total}
              currentPage={page}
              pageSize={perPage}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPerPage(nextPageSize);
                setPage(1);
              }}
              enablePageSizeSelector
            />
          </Flex>
        )}

        <Switch>
          <SuspendedRoute path={`${match.path}/new`}>
            <TypesCreate
              linkToHome={match.url}
              onClose={async () => {
                await refetch();
                push(`${match.url}`);
              }}
              onCreate={async (id: string) => {
                await refetch();
                push(`${match.url}/${id}`);
              }}
            />
          </SuspendedRoute>
          <SuspendedRoute path={`${match.path}/:id`}>
            <TypesEdit
              onClose={async () => {
                await refetch();
                push(`${match.url}`);
              }}
              linkToHome={match.url}
            />
          </SuspendedRoute>
        </Switch>
      </DefaultPage.Content>
    </DefaultPage.Root>
  );
};
TypesList.displayName = 'Types';

export default TypesList;
