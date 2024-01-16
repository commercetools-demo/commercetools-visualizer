import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import {
  PageNotFound,
  TabHeader,
  TabularDetailPage,
} from '@commercetools-frontend/application-components';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { useQuery } from '@apollo/client';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { ReactNode } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { TQuery, TQuery_StatesArgs, TState } from '../../types/generated/ctp';
import { getErrorMessage } from '../../helpers';
import FetchStatesQuery from './fetch-states.cpt.graphql';
import messages from './messages';
import StateFlow from './StateFlow';

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

const States = (props: Props) => {
  const intl = useIntl();
  const history = useHistory();
  const match = useRouteMatch();

  const { data, error, loading } = useQuery<TQuery, TQuery_StatesArgs>(
    FetchStatesQuery,
    {
      variables: {
        limit: 100,
        offset: 0,
      },
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    }
  );

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

  if (!data || !data.states || !data.states.results) {
    return <PageNotFound />;
  }

  const itemsToRender: Array<TabProp> = [];

  const renderState = (itemStates: Array<TState>) => {
    return (
      <>
        <div>Items: {itemStates.length}</div>
        <StateFlow items={itemStates} />
      </>
    );
  };

  const {
    states: { results },
  } = data;

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
      onPreviousPathClick={() => history.push(props.linkToWelcome)}
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
    </TabularDetailPage>
  );
};

States.displayName = 'States';

export default States;
