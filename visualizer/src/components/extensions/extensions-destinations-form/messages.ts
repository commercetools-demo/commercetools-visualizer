import { defineMessages } from 'react-intl';

export default defineMessages({
  destinationHttpUrl: {
    id: 'Extension.Destination.destinationHttpUrl',
    description: 'destinationHttpUrl',
    defaultMessage: 'URL to the target destination',
  },
  destinationHttpAuthentication: {
    id: 'Extension.Destination.destinationHttpAuthentication',
    description: 'destinationHttpAuthentication',
    defaultMessage: 'Authentication methods (such as Basic or Bearer).',
  },
  destinationHttpAuthenticationAzureFunctions: {
    id: 'destinationHttpAuthenticationAzureFunctions',
    description: 'destinationHttpAuthenticationAzureFunctions',
    defaultMessage: 'Azure Function',
  },
  destinationHttpAuthenticationAuthorizationHeader: {
    id: 'destinationHttpAuthenticationAuthorizationHeader',
    description: 'destinationHttpAuthenticationAuthorizationHeader',
    defaultMessage: 'Authorization Header',
  },
});
