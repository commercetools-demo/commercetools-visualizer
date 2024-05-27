import { lazy } from 'react';
import { RestLink } from 'apollo-link-rest';
import {
  ApplicationShell,
  createApolloClient,
  setupGlobalErrorListener,
  selectProjectKeyFromUrl,
} from '@commercetools-frontend/application-shell';
import type { ApplicationWindow } from '@commercetools-frontend/constants';
import loadMessages from '../../load-messages';

declare let window: ApplicationWindow;

// Here we split up the main (app) bundle with the actual application business logic.
// Splitting by route is usually recommended and you can potentially have a splitting
// point for each route. More info at https://reactjs.org/docs/code-splitting.html
const AsyncApplicationRoutes = lazy(
  () => import('../../routes' /* webpackChunkName: "routes" */)
);

// Ensure to setup the global error listener before any React component renders
// in order to catch possible errors on rendering/mounting.
setupGlobalErrorListener();

// TODO: Refactor this code in a better way to fetch mcApiUrl and projectKey.
const { mcApiUrl } = window.app;
const projectKey = selectProjectKeyFromUrl();

const restLink = new RestLink({
  uri: `${mcApiUrl}/proxy/ctp/${projectKey}`,
  headers: {
    Accept: 'application/json',
  },
  credentials: 'include',
});

const configureApollo = () =>
  createApolloClient({
    restLink: restLink,
    cache: {
      typePolicies: { ProductVariant: { keyFields: ['key', 'sku'] } },
    },
  });

const EntryPoint = () => (
  <ApplicationShell
    environment={window.app}
    applicationMessages={loadMessages}
    apolloClient={configureApollo()}
  >
    <AsyncApplicationRoutes />
  </ApplicationShell>
);
EntryPoint.displayName = 'EntryPoint';

export default EntryPoint;
