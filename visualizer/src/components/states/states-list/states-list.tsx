import {
  Link,
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import {
  PageNotFound,
  TabHeader,
  TabularMainPage,
} from '@commercetools-frontend/application-components';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { lazy, ReactNode } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { TState } from '../../../types/generated/ctp';
import { getErrorMessage } from '../../../helpers';
import messages from './messages';
import StateFlow from './states-flow';
import { useStatesFetcher } from '../../../hooks/use-states-hook';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';

const StateCreate = lazy(() => import('../states-create/states-create'));

const StatesEdit = lazy(() => import('../states-edit/states-edit'));

type Props = {
  linkToWelcome: string;
};

export interface TabProp {
  title: string;
  amount: number;
  content: ReactNode;
}

const availableStates = [
  'LineItemState',
  'OrderState',
  'PaymentState',
  'ProductState',
  'QuoteRequestState',
  'QuoteState',
  'ReviewState',
  'StagedQuoteState',
];

const StatesList = (props: Props) => {
  const intl = useIntl();
  const { push, replace } = useHistory();
  const match = useRouteMatch();
  const { type } = useParams<{ type: string }>();
  const baseUrl = props.linkToWelcome + '/states';

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { states, error, loading, refetch } = useStatesFetcher({
    limit: 100,
    offset: 0,
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

  if (!states || !states.results) {
    return <PageNotFound />;
  }

  const itemsToRender: Array<TabProp> = [];

  const renderState = (itemStates: Array<TState>) => {
    return (
      <>
        <div>Items: {itemStates.length}</div>
        <StateFlow
          items={itemStates}
          onNodeClick={(id: string) => push(`${match.url}/${id}`)}
        />
      </>
    );
  };

  const { results } = states;
  if (!type) {
    replace(
      match.url +
        '/' +
        results.filter((item) => item.builtIn)[0].type.toLocaleLowerCase()
    );
  }

  availableStates.forEach((value) => {
    const itemStates = results.filter((item) => {
      return item.type === value;
    });
    if (itemStates && itemStates.length > 0) {
      itemsToRender.push({
        title: value,
        content: renderState(itemStates),
        amount: itemStates.length,
      });
    }
    return;
  });

  const tab = (
    <>
      {itemsToRender.map((item, index) => {
        return (
          <TabHeader
            exactPathMatch={true}
            key={index}
            to={`${baseUrl}/${item.title.toLocaleLowerCase()}`}
            label={intl.formatMessage(
              {
                ...messages[item.title],
              },
              { amount: item.amount }
            )}
          />
        );
      })}
    </>
  );

  return (
    <TabularMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h1" intlMessage={messages.title} />
          <SecondaryButton
            as={Link}
            to={`${match.url}/new`}
            iconLeft={<PlusBoldIcon />}
            label={intl.formatMessage(messages.addState)}
            isDisabled={!canManage}
          />
        </Spacings.Inline>
      }
      tabControls={tab}
    >
      <Switch>
        {itemsToRender.reverse().map((item, index) => {
          return (
            <Route
              key={index}
              exact={true}
              path={`${baseUrl}/${item.title.toLocaleLowerCase()}`}
            >
              <div>{item.content}</div>
            </Route>
          );
        })}
        <SuspendedRoute path={`${match.path}/new`}>
          <StateCreate
            onClose={() => {
              push(match.url);
            }}
            onCreate={async (id: string) => {
              await refetch();
              push(`${match.url}/${id}`);
            }}
          />
        </SuspendedRoute>
        <SuspendedRoute path={`${match.path}/:id`}>
          <StatesEdit
            onClose={async () => {
              await refetch();
              push(match.url);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </TabularMainPage>
  );
};

StatesList.displayName = 'States';

export default StatesList;
