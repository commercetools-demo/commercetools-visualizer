import { PERMISSIONS } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'Visualizer',
  entryPointUriPath: '${env:ENTRY_POINT_URI_PATH}',
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    development: {
      initialProjectKey: '${env:INITIAL_PROJECT_KEY}',
    },
    production: {
      applicationId: '${env:CUSTOM_APPLICATION_ID}',
      url: '${env:APPLICATION_URL}',
    },
  },
  oAuthScopes: {
    view: [
      'view_states',
      'view_types',
      'view_orders',
      'view_customers',
      'view_products',
      'view_shopping_lists',
    ],
    manage: [
      'manage_states',
      'manage_subscriptions',
      'manage_types',
      'manage_extensions',
      'manage_orders',
      'manage_shopping_lists',
    ],
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/rocket.svg}',
  mainMenuLink: {
    defaultLabel: 'Visualizer',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
  submenuLinks: [
    {
      uriPath: 'extensions',
      defaultLabel: 'API Extensions',
      labelAllLocales: [],
      // permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'carts',
      defaultLabel: 'Carts',
      labelAllLocales: [],
      // permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'shopping-lists',
      defaultLabel: 'Shopping Lists',
      labelAllLocales: [],
      // permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'states',
      defaultLabel: 'States',
      labelAllLocales: [],
      // permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'subscriptions',
      defaultLabel: 'Subscriptions',
      labelAllLocales: [],
      // permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'types',
      defaultLabel: 'Types',
      labelAllLocales: [],
      // permissions: [PERMISSIONS.View],
    },
  ],
};

export default config;
