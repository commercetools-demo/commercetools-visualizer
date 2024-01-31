import type { ReactNode } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import Welcome from './components/welcome';
import States from './components/states';
import SubscriptionList from './components/subscriptions';
import SubscriptionDetailsPage from './components/subscriptions/subscription-details-page/subscription-details-page';
import SubscriptionCreate from './components/subscriptions/subscription-create/subscription-create';
import TypesList from './components/types/types-list/types-list';
import ExtensionsList from './components/extensions/extensions-list/extensions-list';

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
        <SubscriptionCreate linkToWelcome={match.url} />
      </Route>
      <Route path={`${match.path}/subscription/new`}>
        <SubscriptionCreate linkToWelcome={match.url} />
      </Route>
      <Route path={`${match.path}/subscription/:id`}>
        <SubscriptionDetailsPage linkToWelcome={`${match.url}/subscriptions`} />
      </Route>
      <Route path={`${match.path}/subscriptions`}>
        <SubscriptionList linkToHome={match.url} />
      </Route>
      <Route path={`${match.path}/extensions`}>
        <ExtensionsList />
      </Route>
      <Route path={`${match.path}/types`}>
        <TypesList />
      </Route>
      <Route>
        <Welcome />
      </Route>
    </Switch>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
