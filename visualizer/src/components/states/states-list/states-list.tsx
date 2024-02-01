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
  TabularDetailPage,
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
  const { push } = useHistory();
  const match = useRouteMatch();
  const { type, id } = useParams<{ type: string; id: string }>();
  let url = match.url;
  if (type && match.url.endsWith(`/${type}`)) {
    url = url.substring(0, url.indexOf(`/${type}`));
  }

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
            to={`${url}${
              index === 0 ? '' : `/${item.title.toLocaleLowerCase()}`
            }`}
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
  //Major CF
  //we want the first tab to be / --> therefore a normal link resolving does not work

  let backUrl = match.url;
  //if there is an id and a type the page is e.g. /orderitem/123-123-123
  if (id && type && backUrl.endsWith(`/${id}`)) {
    backUrl = backUrl.substring(0, backUrl.indexOf(`/${id}`));
    //if there is a type the page is e.g. /123-123-123
  } else if (type && backUrl.endsWith(`/${type}`)) {
    backUrl = backUrl.substring(0, backUrl.indexOf(`/${type}`));
  }

  return (
    <TabularDetailPage
      onPreviousPathClick={() => push(props.linkToWelcome)}
      previousPathLabel={intl.formatMessage(messages.backToWelcome)}
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2" intlMessage={messages.title} />
          <SecondaryButton
            as={Link}
            to={`${match.url}/new`}
            iconLeft={<PlusBoldIcon />}
            label={intl.formatMessage(messages.addState)}
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
              path={`${url}${
                index === itemsToRender.length - 1
                  ? ''
                  : `/${item.title.toLocaleLowerCase()}`
              }`}
            >
              <div>{item.content}</div>
            </Route>
          );
        })}
      </Switch>
      <Switch>
        <SuspendedRoute path={`${match.path}/new`}>
          <StateCreate
            onClose={() => {
              refetch();
              push(backUrl);
            }}
            onCreate={(id: string) => {
              refetch();
              push(`${backUrl}/${id}`);
            }}
          />
        </SuspendedRoute>
        <SuspendedRoute path={`${match.path}/:id`}>
          <StatesEdit
            onClose={() => {
              refetch();
              push(backUrl);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </TabularDetailPage>
  );
};

StatesList.displayName = 'States';

export default StatesList;
