// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

declare const window: Window &
  typeof globalThis & {
    app: { entryPointUriPath: string };
  };

export const entryPointUriPath =
  typeof window === 'undefined' ? 'visualizer' : window.app.entryPointUriPath;

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);
