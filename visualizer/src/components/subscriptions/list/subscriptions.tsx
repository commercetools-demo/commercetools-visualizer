import {
  InfoMainPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { useIntl } from 'react-intl';
import { useHistory, Link } from 'react-router-dom';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { Pagination } from '@commercetools-uikit/pagination';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { getErrorMessage } from '../../../helpers';
import { TCommercetoolsSubscription } from '../../../types/generated/ctp';
import PubSub from '../icons/google-cloud-pub-sub-logo.svg';
import Destinations from '../destinations/Destinations';
import messages from './messages';
import { useSubscriptionsFetcher } from '../../../hooks/use-subscription-connector/subscription-connectors';

type Props = {
  linkToHome: string;
};

const Subscriptions = (props: Props) => {
  const intl = useIntl();
  const { push } = useHistory();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { page, perPage } = usePaginationState();
  const { subscriptions, error, loading } = useSubscriptionsFetcher({
    limit: perPage.value,
    offset: (page.value - 1) * perPage.value,
    sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
  });

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  if (!subscriptions || !subscriptions.results) {
    return <PageNotFound />;
  }

  const { results } = subscriptions;

  const columns: Array<TColumn> = [
    { key: 'key', label: 'Key', isSortable: true },
    { key: 'version', label: 'Version' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'destinationType', label: 'Destination Type' },
    { key: 'destination', label: 'Destination Specific' },
    { key: 'messages', label: 'Messages' },
  ];

  const itemRenderer = (
    item: TCommercetoolsSubscription,
    column: TColumn<TCommercetoolsSubscription>
  ) => {
    switch (column.key) {
      case 'messages': {
        const casted: TCommercetoolsSubscription =
          item as TCommercetoolsSubscription;
        return casted.messages.map((item, key) => {
          return (
            <div key={key}>
              <div>
                {`${item.resourceTypeId}: `}
                {item.types?.map((type, index) => {
                  return <span key={index}>{type}</span>;
                })}
              </div>
            </div>
          );
        });
      }
      case 'key':
        return item.key;
      case 'version':
        return item.version;
      case 'createdAt':
        return intl.formatDate(item.createdAt);
      case 'destinationType':
        switch (item.destination.type) {
          case 'GoogleCloudPubSub':
            return (
              <img
                alt={item.destination.type}
                title={item.destination.type}
                src={PubSub}
                width="30px"
                height="100%"
              />
            );
          default:
            return item.destination.type;
        }
      case 'destination':
        return <Destinations destination={item.destination} />;
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (item as any)[column.key];
    }
  };
  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2">
            {intl.formatMessage(messages.title)}
          </Text.Headline>

          <SecondaryButton
            iconLeft={<PlusBoldIcon />}
            as={Link}
            to={props.linkToHome + '/subscription/new'}
            label={intl.formatMessage(messages.subscriptionAdd)}
          />
        </Spacings.Inline>
      }
    >
      {subscriptions.total === 0 && (
        <div>{intl.formatMessage(messages.noResults)}</div>
      )}
      {subscriptions.total > 0 && (
        <Spacings.Stack>
          <DataTable<NonNullable<TCommercetoolsSubscription>>
            isCondensed
            columns={columns}
            rows={results}
            itemRenderer={itemRenderer}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(row) =>
              push(`${props.linkToHome}/subscription/${row.id}`)
            }
          />
          <Pagination
            page={page.value}
            onPageChange={page.onChange}
            perPage={perPage.value}
            onPerPageChange={perPage.onChange}
            totalItems={subscriptions.total}
          />
        </Spacings.Stack>
      )}
    </InfoMainPage>
  );
};

Subscriptions.displayName = 'Subscriptions';

export default Subscriptions;
