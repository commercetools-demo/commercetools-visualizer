import { FC, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  InfoMainPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { TColumn } from '@commercetools-uikit/data-table';
import { TDataTableProps } from '@commercetools-uikit/data-table/dist/declarations/src/data-table';
import { TCustomObject } from '../../../types/generated/ctp';
import { PaginatableDataTable } from 'commercetools-demo-shared-paginatable-data-table';
import messages from './messages';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import {
  CheckActiveIcon,
  CheckInactiveIcon,
  PlusBoldIcon,
} from '@commercetools-uikit/icons';
import {
  getErrorMessage,
  useCustomObjectsFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import SearchTextInput from '@commercetools-uikit/search-text-input';
import { debounce } from 'lodash';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import CustomObjectEdit from '../custom-object-edit/custom-object-edit';
import CustomObjectCreate from '../custom-object-create/custom-object-create';
import FieldLabel from '@commercetools-uikit/field-label';
import {
  formatDateAndTime,
  renderDefault,
} from 'commercetools-demo-shared-helpers';

type Props = {
  linkToHome: string;
};

const CustomObjectsList: FC<Props> = ({ linkToHome }) => {
  const intl = useIntl();
  const { push } = useHistory();
  const match = useRouteMatch();

  const [container, setContainer] = useState('');

  const debouncedContainerName = useCallback(
    debounce((searchQuery) => setContainer(searchQuery), 1000),
    []
  );

  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const paginationState = usePaginationState();
  const { customObjects, error, loading, refetch } = useCustomObjectsFetcher({
    container: container,
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

  if (!customObjects || !customObjects.results) {
    return <PageNotFound />;
  }

  const { results } = customObjects;

  const columns: Array<TColumn> = [
    { key: 'id', label: 'Id' },
    { key: 'container', label: 'Container' },
    { key: 'key', label: 'Key', isSortable: true },
    { key: 'version', label: 'Version' },
    { key: 'createdAt', label: 'Created At', isSortable: true },
    { key: 'lastModifiedAt', label: 'Last Modified At', isSortable: true },
    { key: 'value', label: 'Has Value' },
  ];

  const visibleColumns: Array<TColumn> = [
    { key: 'container', label: 'Container', isSortable: true },
    { key: 'key', label: 'Key', isSortable: true },
    { key: 'value', label: 'Value' },
  ];

  const itemRenderer: TDataTableProps<TCustomObject>['itemRenderer'] = (
    item,
    column
  ) => {
    switch (column.key) {
      case 'createdAt':
      case 'lastModifiedAt':
        return formatDateAndTime(item[column.key], intl);
      case 'value': {
        return item.value ? (
          <CheckActiveIcon color={'primary'} />
        ) : (
          <CheckInactiveIcon color={'neutral60'} />
        );
      }
      default:
        return renderDefault(item[column.key as keyof TCustomObject]);
    }
  };
  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h1">
            {intl.formatMessage(messages.title)}
          </Text.Headline>

          <SecondaryButton
            iconLeft={<PlusBoldIcon />}
            as={Link}
            to={linkToHome + '/custom-objects/new'}
            label={intl.formatMessage(messages.customObjectAdd)}
          />
        </Spacings.Inline>
      }
    >
      <Spacings.Stack scale={'l'}>
        <Spacings.Stack scale={'s'}>
          <FieldLabel title={'Container Name'} />
          <SearchTextInput
            onChange={(event) => debouncedContainerName(event.target.value)}
            onReset={() => setContainer('')}
            onSubmit={debouncedContainerName}
            placeholder="Container Name"
            value={container}
          />
          <PaginatableDataTable<TCustomObject>
            isCondensed
            columns={columns}
            visibleColumns={visibleColumns}
            rows={results}
            itemRenderer={itemRenderer}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(row) => push(`${linkToHome}/custom-objects/${row.id}`)}
            paginationState={paginationState}
            totalItems={customObjects.total}
          />
        </Spacings.Stack>
      </Spacings.Stack>
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
    </InfoMainPage>
  );
};

export default CustomObjectsList;
