import { FC, lazy } from 'react';
import { useIntl } from 'react-intl';
import { Link, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { ContentNotification } from '@commercetools-uikit/notifications';
import {
  InfoMainPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { getErrorMessage } from '../../../helpers';
import { TTypeDefinition } from '../../../types/generated/ctp';
import messages from './messages';
import createColumnDefinitions from './column-definitions';
import { useTypesFetcher } from '../../../hooks/use-types-connector';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import { TDataTableProps } from '@commercetools-uikit/data-table/dist/declarations/src/data-table';
import {
  PaginatableDataTable,
  renderDefault,
  formatLocalizedString,
  formatDateAndTime,
} from 'commercetools-demo-shared-paginatable-data-table';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
const TypesCreate = lazy(() => import('../types-create/types-create'));

const TypesEdit = lazy(() => import('../types-edit/types-edit'));

type Props = {};

const TypesList: FC<Props> = () => {
  const intl = useIntl();
  const { push } = useHistory();
  const match = useRouteMatch();
  const paginationState = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const { typeDefinitions, error, loading, refetch } = useTypesFetcher({
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

  if (!typeDefinitions || !typeDefinitions.results) {
    return <PageNotFound />;
  }

  const { results, total } = typeDefinitions;

  const itemRenderer: TDataTableProps<TTypeDefinition>['itemRenderer'] = (
    item,
    column
  ) => {
    switch (column.key) {
      case 'name':
        return formatLocalizedString(
          item.nameAllLocales,
          dataLocale,
          projectLanguages
        );
      case 'description':
        return formatLocalizedString(
          item.descriptionAllLocales,
          dataLocale,
          projectLanguages
        );
      case 'resourceTypeIds':
        return item.resourceTypeIds.join(', ');
      case 'fieldCount':
        return item.fieldDefinitions.length;
      case 'createdAt':
      case 'lastModifiedAt':
        return formatDateAndTime(item[column.key], intl);
      default:
        return renderDefault(item[column.key as keyof TTypeDefinition]);
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
            isDisabled={!canManage}
          />
        </Spacings.Inline>
      }
    >
      {total === 0 && <div>{intl.formatMessage(messages.noResults)}</div>}

      {total > 0 ? (
        <PaginatableDataTable<TTypeDefinition>
          isCondensed
          columns={createColumnDefinitions(intl.formatMessage)}
          visibleColumns={createColumnDefinitions(intl.formatMessage)}
          rows={results}
          itemRenderer={itemRenderer}
          onRowClick={(row) => push(`${match.url}/${row.id}`)}
          sortedBy={tableSorting.value.key}
          sortDirection={tableSorting.value.order}
          onSortChange={tableSorting.onChange}
          paginationState={paginationState}
          totalItems={total}
        />
      ) : null}
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
    </InfoMainPage>
  );
};
TypesList.displayName = 'Types';

export default TypesList;
