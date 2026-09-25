import {
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { useIntl } from 'react-intl';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { lazy, ReactNode, useEffect } from 'react';
import {
  Alert,
  Button,
  DefaultPage,
  Flex,
  LoadingSpinner,
  Stack,
  TabNav,
  Text,
} from '@commercetools/nimbus';
import { Add } from '@commercetools/nimbus-icons';
import { TState } from '../../../types/generated/ctp';
import messages from './messages';
import StateFlow from './states-flow';
import { getErrorMessage, useStatesFetcher } from '../../../hooks';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
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
    // The flow diagram needs every state across all types in one shot, so
    // request the API's max page size rather than paginating.
    limit: 500,
    offset: 0,
  });

  // Redirect to the first available tab when no type is selected. Done in an
  // effect (not during render) and guarded so an empty/no-builtIn result set
  // does not crash.
  useEffect(() => {
    if (type || !states?.results?.length) {
      return;
    }
    const defaultState =
      states.results.find((item) => item.builtIn) ?? states.results[0];
    if (defaultState) {
      replace(`${match.url}/${defaultState.type.toLocaleLowerCase()}`);
    }
  }, [type, states, match.url, replace]);

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

  if (!states || !states.results) {
    return <PageNotFound />;
  }

  const itemsToRender: Array<TabProp> = [];

  const renderState = (itemStates: Array<TState>) => {
    return (
      <Stack direction="column" gap="400">
        <Text>
          {intl.formatMessage(messages.itemsCount, {
            amount: itemStates.length,
          })}
        </Text>
        <StateFlow
          items={itemStates}
          onNodeClick={(id: string) => push(`${match.url}/${id}`)}
        />
      </Stack>
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
            isDisabled={!canManage}
            onPress={() => push(`${match.url}/new`)}
          >
            <Add />
            {intl.formatMessage(messages.addState)}
          </Button>
        </DefaultPage.Actions>
        <DefaultPage.TabNav>
          <TabNav.Root aria-label={intl.formatMessage(messages.title)}>
            {itemsToRender.map((item) => {
              const to = `${baseUrl}/${item.title.toLocaleLowerCase()}`;
              return (
                <TabNav.Item
                  key={item.title}
                  href={to}
                  isCurrent={
                    type?.toLocaleLowerCase() === item.title.toLocaleLowerCase()
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    push(to);
                  }}
                >
                  {intl.formatMessage(
                    { ...messages[item.title] },
                    { amount: item.amount }
                  )}
                </TabNav.Item>
              );
            })}
          </TabNav.Root>
        </DefaultPage.TabNav>
      </DefaultPage.Header>
      <DefaultPage.Content>
        <Switch>
          {itemsToRender.map((item, index) => {
            return (
              <Route
                key={index}
                exact={true}
                path={`${baseUrl}/${item.title.toLocaleLowerCase()}`}
              >
                {item.content}
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
      </DefaultPage.Content>
    </DefaultPage.Root>
  );
};

StatesList.displayName = 'States';

export default StatesList;
