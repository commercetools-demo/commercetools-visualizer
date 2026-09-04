import { PageNotFound } from '@commercetools-frontend/application-components';
import { useIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import { TCommercetoolsSubscription } from '../../../types/generated/ctp';
import messages from './messages';
import { getErrorMessage, useSubscriptionsFetcher } from '../../../hooks';
import createColumnDefinitions from './column-definitions';

type Props = {
  linkToHome: string;
};

interface LocationState {
  refetch?: boolean;
}

const DEFAULT_PER_PAGE = 20;

const toSortString = (sortDescriptor: SortDescriptor): string =>
  `${String(sortDescriptor.column)} ${
    sortDescriptor.direction === 'descending' ? 'desc' : 'asc'
  }`;

const SubscriptionList = (props: Props) => {
  const intl = useIntl();
  const { push } = useHistory();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'key',
    direction: 'ascending',
  });

  const { subscriptions, error, loading, refetch } = useSubscriptionsFetcher({
    limit: perPage,
    offset: (page - 1) * perPage,
    sort: [toSortString(sortDescriptor)],
  });

  const location = useLocation<LocationState>();

  useEffect(() => {
    if (location.state?.refetch) {
      refetch();
    }
  }, [location]);

  if (error) {
    return (
      <Alert.Root colorPalette="critical">
        <Alert.Title>{intl.formatMessage(messages.title)}</Alert.Title>
        <Alert.Description>{getErrorMessage(error)}</Alert.Description>
      </Alert.Root>
    );
  }
  if (loading) {
    return (
      <Flex justifyContent="center" padding="600">
        <LoadingSpinner aria-label={intl.formatMessage(messages.title)} />
      </Flex>
    );
  }

  if (!subscriptions || !subscriptions.results) {
    return <PageNotFound />;
  }

  const { results, total } = subscriptions;

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
            onPress={() => push(`${props.linkToHome}/subscription/new`)}
          >
            <Add />
            {intl.formatMessage(messages.subscriptionAdd)}
          </Button>
        </DefaultPage.Actions>
      </DefaultPage.Header>
      <DefaultPage.Content>
        {total === 0 ? (
          <Text color="neutral.11">
            {intl.formatMessage(messages.noResults)}
          </Text>
        ) : (
          <Flex direction="column" gap="400">
            <DataTable<TCommercetoolsSubscription>
              columns={createColumnDefinitions({ intl })}
              rows={results}
              allowsSorting
              sortDescriptor={sortDescriptor}
              onSortChange={(descriptor) => {
                setSortDescriptor(descriptor);
                setPage(1);
              }}
              onRowClick={(row) =>
                push(`${props.linkToHome}/subscription/${row.id}`)
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
      </DefaultPage.Content>
    </DefaultPage.Root>
  );
};

SubscriptionList.displayName = 'Subscriptions';

export default SubscriptionList;
