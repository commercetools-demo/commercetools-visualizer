import { useState } from 'react';
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
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import { getErrorMessage, useExtensionsFetcher } from '../../../hooks';
import { TExtension } from '../../../types/generated/ctp';
import { PERMISSIONS } from '../../../constants';
import messages from './messages';
import createColumnDefinitions from './column-definitions';
import ExtensionsCreate from '../extensions-create/extensions-create';
import ExtensionsEdit from '../extensions-edit/extensions-edit';

const DEFAULT_PER_PAGE = 20;

const toSortString = (sortDescriptor: SortDescriptor): string =>
  `${String(sortDescriptor.column)} ${
    sortDescriptor.direction === 'descending' ? 'desc' : 'asc'
  }`;

const ExtensionsList = () => {
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

  const { extensions, error, loading, refetch } = useExtensionsFetcher({
    limit: perPage,
    offset: (page - 1) * perPage,
    sort: [toSortString(sortDescriptor)],
  });

  const total = extensions?.total ?? 0;
  const results = (extensions?.results ?? []) as Array<TExtension>;

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
            <DataTable<TExtension>
              columns={createColumnDefinitions(intl)}
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
            <ExtensionsCreate
              onSuccess={async (id: string) => {
                await refetch();
                push(`${match.url}/${id}`);
              }}
              onClose={async () => {
                await refetch();
                push(`${match.url}`);
              }}
            />
          </SuspendedRoute>
          <SuspendedRoute path={`${match.path}/:id`}>
            <ExtensionsEdit
              onClose={async () => {
                await refetch();
                push(`${match.url}`);
              }}
            />
          </SuspendedRoute>
        </Switch>
      </DefaultPage.Content>
    </DefaultPage.Root>
  );
};

export default ExtensionsList;
