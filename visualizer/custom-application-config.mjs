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
  // headers: {
  //   csp: {
  //     'script-src': ['self', 'blob:'],
  //
  //     'connect-src': [],
  //   },
  // },
  oAuthScopes: {
    view: [
      'view_states',
      'view_types',
      'view_orders',
      'view_customers',
      'view_products',
      'view_shopping_lists',
      'view_key_value_documents',
      'view_stores',
      'view_product_selections',
    ],
    manage: [
      'manage_states',
      'manage_subscriptions',
      'manage_types',
      'manage_extensions',
      'manage_orders',
      'manage_shopping_lists',
      'manage_key_value_documents',
    ],
  },
  headers: {
    csp: {
      'connect-src': ['sigmajs.org'],
      'frame-src': ['sigmajs.org'],
    },
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
      permissions: [PERMISSIONS.Manage],
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
      permissions: [PERMISSIONS.Manage],
    },
    {
      uriPath: 'types',
      defaultLabel: 'Types',
      labelAllLocales: [],
      // permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'custom-objects',
      defaultLabel: 'Custom Objects',
      labelAllLocales: [],
      // permissions: [PERMISSIONS.View],
    },
  ],
};

export default config;
