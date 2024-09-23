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
import { TColumn } from '@commercetools-uikit/data-table';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { getErrorMessage } from '../../../helpers';
import { TCommercetoolsSubscription } from '../../../types/generated/ctp';
import messages from './messages';
import destinationMessages from '../subscription-destination-type-form/messages';
import { useSubscriptionsFetcher } from '../../../hooks/use-subscription-connector/subscription-connectors';
import PaginatableDataTable from '../../paginatable-data-table/paginatable-data-table';
import { TDataTableProps } from '@commercetools-uikit/data-table/dist/declarations/src/data-table';
import {
  formatDateAndTime,
  renderDefault,
} from '../../paginatable-data-table/helpers';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

type Props = {
  linkToHome: string;
};

interface LocationState {
  refetch?: boolean;
}

const SubscriptionList = (props: Props) => {
  const intl = useIntl();
  const { push } = useHistory();

  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const paginationState = usePaginationState();
  const { subscriptions, error, loading, refetch } = useSubscriptionsFetcher({
    limit: paginationState.perPage.value,
    offset: (paginationState.page.value - 1) * paginationState.perPage.value,
    sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
  });

  const location = useLocation<LocationState>();

  useEffect(() => {
    if (location.state?.refetch) {
      refetch();
    }
  }, [location]);

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
    // { key: 'messages', label: 'Messages' },
  ];

  const itemRenderer: TDataTableProps<TCommercetoolsSubscription>['itemRenderer'] =
    (item, column) => {
      switch (column.key) {
        case 'messages': {
          return item.messages.map((item, key) => {
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
        case 'createdAt':
        case 'lastModifiedAt':
          return formatDateAndTime(item[column.key], intl);
        case 'destinationType':
          try {
            return intl.formatMessage(
              destinationMessages[
              ('destination' +
                item.destination.type) as keyof typeof destinationMessages
              ]
            );
          } catch (e) {
            return item.destination.type;
          }
        default:
          return renderDefault(
            item[column.key as keyof TCommercetoolsSubscription]
          );
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
          <PaginatableDataTable<TCommercetoolsSubscription>
            isCondensed
            columns={columns}
            visibleColumns={columns}
            rows={results}
            itemRenderer={itemRenderer}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(row) =>
              push(`${props.linkToHome}/subscription/${row.id}`)
            }
            paginationState={paginationState}
            totalItems={subscriptions.total}
          />
        </Spacings.Stack>
      )}
    </InfoMainPage>
  );
};

SubscriptionList.displayName = 'Subscriptions';

export default SubscriptionList;
