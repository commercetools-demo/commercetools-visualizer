import type { ReactNode } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import Welcome from './components/welcome';
import States from './components/states';
import Subscriptions from './components/subscriptions';
import SubscriptionDetail from './components/subscriptions/SubscriptionDetail';
import NewSubscription from './components/subscriptions/new/NewSubscription';
import Types from './components/types/list/types';
import EditType from './components/types/edit';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const match = useRouteMatch();

  /**
   * When using routes, there is a good chance that you might want to
   * restrict the access to a certain route based on the user permissions.
   * You can evaluate user permissions using the `useIsAuthorized` hook.
   * For more information see https://docs.commercetools.com/custom-applications/development/permissions
   *
   * NOTE that by default the Custom Application implicitly checks for a "View" permission,
   * otherwise it won't render. Therefore, checking for "View" permissions here
   * is redundant and not strictly necessary.
   */

  return (
    <Switch>
      <Route path={`${match.path}/states`}>
        <States linkToWelcome={match.url} />
      </Route>
      <Route path={`${match.path}/subscription/new/:step`}>
        <NewSubscription linkToWelcome={match.url} />
      </Route>
      <Route path={`${match.path}/subscription/new`}>
        <NewSubscription linkToWelcome={match.url} />
      </Route>
      <Route path={`${match.path}/subscription/:id`}>
        <SubscriptionDetail linkToWelcome={`${match.url}/subscriptions`} />
      </Route>
      <Route path={`${match.path}/subscriptions`}>
        <Subscriptions linkToWelcome={match.url} />
      </Route>
      <Route path={`${match.path}/types/:id`}>
        <EditType linkToWelcome={match.url} />
      </Route>
      <Route path={`${match.path}/types`}>
        <Types linkToWelcome={match.url} />
      </Route>
      <Route>
        <Welcome />
      </Route>
    </Switch>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
