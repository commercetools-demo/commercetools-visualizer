import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import {
  PageNotFound,
  TabHeader,
  TabularDetailPage,
} from '@commercetools-frontend/application-components';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { ReactNode } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { TState } from '../../../types/generated/ctp';
import { getErrorMessage } from '../../../helpers';
import messages from './messages';
import StateFlow from './states-flow';
import { useStatesFetcher } from '../../../hooks/use-states-hook';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import StatesEdit from '../states-edit/states-edit';

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
            to={`${match.url}${
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

  return (
    <TabularDetailPage
      onPreviousPathClick={() => push(props.linkToWelcome)}
      previousPathLabel={intl.formatMessage(messages.backToWelcome)}
      title={intl.formatMessage(messages.title)}
      tabControls={tab}
    >
      <Switch>
        {itemsToRender.reverse().map((item, index) => {
          return (
            <Route
              key={index}
              path={`${match.url}${
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
        <SuspendedRoute path={`${match.path}/:id`}>
          <StatesEdit
            onClose={() => {
              refetch();
              push(`${match.url}`);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </TabularDetailPage>
  );
};

StatesList.displayName = 'States';

export default StatesList;
