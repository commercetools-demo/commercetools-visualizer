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
  destinationHttpAuthorizationHeaderFieldLabel: {
    id: 'Extension.Destination.destinationHttpAuthorizationHeaderFieldLabel',
    description: 'Label for the authorization header value field',
    defaultMessage: 'Authorization header',
  },
  destinationHttpAuthorizationKeyFieldLabel: {
    id: 'Extension.Destination.destinationHttpAuthorizationKeyFieldLabel',
    description: 'Label for the Azure Functions authorization key field',
    defaultMessage: 'Authorization Key',
  },
  destinationAwsArn: {
    id: 'Extension.Destination.destinationAwsArn',
    description: 'Label for the AWS Lambda ARN field',
    defaultMessage: 'ARN',
  },
  destinationAwsAccessKey: {
    id: 'Extension.Destination.destinationAwsAccessKey',
    description: 'Label for the AWS Lambda access key field',
    defaultMessage: 'AccessKey',
  },
  destinationAwsAccessSecret: {
    id: 'Extension.Destination.destinationAwsAccessSecret',
    description: 'Label for the AWS Lambda access secret field',
    defaultMessage: 'AccessSecret',
  },
  noMappingDefined: {
    id: 'Extension.Destination.noMappingDefined',
    description: 'Shown for destination types with no configuration UI',
    defaultMessage: 'No mapping defined so far for {destinationType}',
  },
});
