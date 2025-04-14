// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

declare const window: Window &
  typeof globalThis & {
    app: { entryPointUriPath: string };
  };

export const entryPointUriPath =
  typeof window === 'undefined'
    ? process.env.ENTRY_POINT_URI_PATH || 'visualizer'
    : window.app.entryPointUriPath || 'visualizer';

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);

export enum SHORT_ADDRESS_TYPE {
  BILLING = 'billing',
  SHIPPING = 'shipping',
}

export const INVENTORY_MODES = {
  NONE: 'None',
};
