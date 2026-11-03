export const projectKey = Cypress.env('PROJECT_KEY');

// Must match `entryPointUriPath` in custom-application-config.mjs (ENTRY_POINT_URI_PATH).
export const entryPointUriPath = 'visualizer';

export const applicationBaseRoute = `/${projectKey}/${entryPointUriPath}`;
