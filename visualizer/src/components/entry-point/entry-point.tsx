import { lazy } from 'react';
import {
  ApplicationShell,
  setupGlobalErrorListener,
} from '@commercetools-frontend/application-shell';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import type { ApplicationWindow } from '@commercetools-frontend/constants';
import { NimbusProvider } from '@commercetools/nimbus';
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

const ApplicationRoutesWithNimbus = () => {
  const dataLocale = useApplicationContext(
    (context) => context.dataLocale ?? ''
  );

  return (
    <NimbusProvider locale={dataLocale || 'en'} loadFonts={false}>
      <AsyncApplicationRoutes />
    </NimbusProvider>
  );
};

const EntryPoint = () => (
  <ApplicationShell
    enableReactStrictMode
    environment={window.app}
    applicationMessages={loadMessages}
  >
    <ApplicationRoutesWithNimbus />
  </ApplicationShell>
);
EntryPoint.displayName = 'EntryPoint';

export default EntryPoint;
