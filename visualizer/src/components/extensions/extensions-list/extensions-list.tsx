import { useIntl } from 'react-intl';
import { Link, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import createColumnDefinitions from './column-definitions';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  InfoMainPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { useExtensionsFetcher } from '../../../hooks/use-extensions-connector';
import { TExtension } from '../../../types/generated/ctp';
import messages from './messages';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import ExtensionsCreate from '../extensions-create/extensions-create';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import ExtensionsEdit from '../extensions-edit/extensions-edit';
import { TDataTableProps } from '@commercetools-uikit/data-table/dist/declarations/src/data-table';
import PaginatableDataTable from '../../paginatable-data-table/paginatable-data-table';
import {
  formatDateAndTime,
  renderDefault,
} from '../../paginatable-data-table/helpers';

const ExtensionsList = () => {
  const intl = useIntl();
  const { push } = useHistory();
  const match = useRouteMatch();
  const paginationState = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });

  const { extensions, error, loading, refetch } = useExtensionsFetcher({
    limit: paginationState.perPage.value,
    offset: (paginationState.page.value - 1) * paginationState.perPage.value,
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

  if (!extensions || !extensions.results) {
    return <PageNotFound />;
  }

  const { results, total } = extensions;

  const itemRenderer: TDataTableProps<TExtension>['itemRenderer'] = (
    item,
    column
  ) => {
    switch (column.key) {
      case 'destination':
        return item.destination.type;
      case 'triggers':
        return item.triggers.map((value) => value.resourceTypeId).join(', ');
      case 'createdAt':
      case 'lastModifiedAt':
        return formatDateAndTime(item[column.key], intl);
      default:
        return renderDefault(item[column.key as keyof TExtension]);
    }
  };

  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h1" intlMessage={messages.title} />
          <SecondaryButton
            as={Link}
            to={`${match.url}/new`}
            iconLeft={<PlusBoldIcon />}
            label={intl.formatMessage(messages.addType)}
          />
        </Spacings.Inline>
      }
    >
      {total === 0 && <div>{intl.formatMessage(messages.noResults)}</div>}

      {total > 0 ? (
        <PaginatableDataTable<TExtension>
          columns={createColumnDefinitions(intl.formatMessage)}
          visibleColumns={createColumnDefinitions(intl.formatMessage)}
          rows={results}
          itemRenderer={itemRenderer}
          sortedBy={tableSorting.value.key}
          sortDirection={tableSorting.value.order}
          onSortChange={tableSorting.onChange}
          onRowClick={(row) => push(`${match.url}/${row.id}`)}
          totalItems={total}
          paginationState={paginationState}
        />
      ) : null}
      <Switch>
        <SuspendedRoute path={`${match.path}/new`}>
          <ExtensionsCreate
            onClose={() => {
              refetch();
              push(`${match.url}`);
            }}
          />
        </SuspendedRoute>
        <SuspendedRoute path={`${match.path}/:id`}>
          <ExtensionsEdit
            onClose={() => {
              refetch();
              push(`${match.url}`);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </InfoMainPage>
  );
};

export default ExtensionsList;
