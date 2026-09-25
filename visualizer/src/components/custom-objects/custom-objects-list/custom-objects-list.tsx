import { FC, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import debounce from 'lodash/debounce';
import {
  Alert,
  Button,
  DataTable,
  DefaultPage,
  Flex,
  FormField,
  LoadingSpinner,
  Pagination,
  SearchInput,
  Stack,
  Text,
  type SortDescriptor,
} from '@commercetools/nimbus';
import { Add } from '@commercetools/nimbus-icons';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { getErrorMessage, useCustomObjectsFetcher } from '../../../hooks';
import { TCustomObject } from '../../../types/generated/ctp';
import messages from './messages';
import createColumnDefinitions from './column-definitions';
import CustomObjectEdit from '../custom-object-edit/custom-object-edit';
import CustomObjectCreate from '../custom-object-create/custom-object-create';
import { PERMISSIONS } from '../../../constants';

const DEFAULT_PER_PAGE = 20;

type Props = {
  linkToHome: string;
};

const CustomObjectsList: FC<Props> = ({ linkToHome }) => {
  const intl = useIntl();
  const { push } = useHistory();
  const match = useRouteMatch();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const [container, setContainer] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'key',
    direction: 'ascending',
  });

  const debouncedSetContainer = useCallback(
    debounce((value: string) => {
      setContainer(value);
      setPage(1);
    }, 1000),
    []
  );

  const { customObjects, error, loading, refetch } = useCustomObjectsFetcher({
    container,
    limit: perPage,
    offset: (page - 1) * perPage,
    sort: [
      `${String(sortDescriptor.column)} ${
        sortDescriptor.direction === 'descending' ? 'desc' : 'asc'
      }`,
    ],
  });

  const total = customObjects?.total ?? 0;
  const results = (customObjects?.results ?? []) as Array<TCustomObject>;

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
            onPress={() => push(`${linkToHome}/custom-objects/new`)}
          >
            <Add />
            {intl.formatMessage(messages.customObjectAdd)}
          </Button>
        </DefaultPage.Actions>
      </DefaultPage.Header>
      <DefaultPage.Content>
        {error ? (
          <Alert.Root colorPalette="critical">
            <Alert.Title>{intl.formatMessage(messages.title)}</Alert.Title>
            <Alert.Description>{getErrorMessage(error)}</Alert.Description>
          </Alert.Root>
        ) : (
          <Stack direction="column" gap="400">
            <FormField.Root maxWidth="400px">
              <FormField.Label>
                {intl.formatMessage(messages.containerFilterLabel)}
              </FormField.Label>
              <FormField.Input>
                <SearchInput
                  aria-label={intl.formatMessage(messages.containerFilterLabel)}
                  placeholder={intl.formatMessage(
                    messages.containerFilterPlaceholder
                  )}
                  value={container}
                  onChange={debouncedSetContainer}
                  onClear={() => {
                    setContainer('');
                    setPage(1);
                  }}
                />
              </FormField.Input>
            </FormField.Root>

            {loading ? (
              <Flex justifyContent="center" padding="600">
                <LoadingSpinner
                  aria-label={intl.formatMessage(messages.title)}
                />
              </Flex>
            ) : total === 0 ? (
              <Text color="neutral.11">
                {intl.formatMessage(messages.noResults)}
              </Text>
            ) : (
              <Flex direction="column" gap="400">
                <DataTable<TCustomObject>
                  columns={createColumnDefinitions({ intl })}
                  rows={results}
                  allowsSorting
                  sortDescriptor={sortDescriptor}
                  onSortChange={(descriptor) => {
                    setSortDescriptor(descriptor);
                    setPage(1);
                  }}
                  onRowClick={(row) =>
                    push(`${linkToHome}/custom-objects/${row.id}`)
                  }
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
          </Stack>
        )}

        <Switch>
          <SuspendedRoute path={`${match.path}/new`}>
            <CustomObjectCreate
              onClose={async () => {
                await refetch();
                push(`${match.url}`);
              }}
              onSuccess={async (id: string) => {
                await refetch();
                push(`${match.url}/${id}`);
              }}
            />
          </SuspendedRoute>
          <SuspendedRoute path={`${match.path}/:id`}>
            <CustomObjectEdit
              onClose={async () => {
                await refetch();
                push(`${match.url}`);
              }}
              onIdChange={async (id: string) => {
                await refetch();
                push(`${match.url}/${id}`);
              }}
            />
          </SuspendedRoute>
        </Switch>
      </DefaultPage.Content>
    </DefaultPage.Root>
  );
};

export default CustomObjectsList;
