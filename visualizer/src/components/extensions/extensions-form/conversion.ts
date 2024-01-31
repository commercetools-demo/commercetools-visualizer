import {
  DestinationHttpAuthenticationName,
  DestinationName,
  TFormValues,
} from './extensions-form';
import {
  TAuthorizationHeader,
  TAwsLambdaDestination,
  TAzureFunctionsAuthentication,
  TExtension,
  TExtensionDestinationInput,
  TExtensionDraft,
  THttpDestination,
  THttpDestinationAuthenticationInput,
  TTriggerInput,
} from '../../../types/generated/ctp';

export const tExtensionToFormValues = (extension?: TExtension): TFormValues => {
  let destinationName: DestinationName = 'HTTP';
  let destinationHttpUrl = undefined;
  let destinationHttpAuthenticationName: DestinationHttpAuthenticationName = '';
  let destinationHttpAuthenticationAuthorizationHeaderValue = undefined;
  let destinationHttpAuthenticationAuthorizationKey = undefined;
  let destinationAwsAccessKey = undefined;
  let destinationAwsAccessSecret = undefined;
  let destinationAwsArn = undefined;
  switch (extension?.destination.type) {
    case 'HTTP': {
      destinationName = 'HTTP';
      const dest = extension?.destination as THttpDestination;
      switch (dest?.authentication?.type) {
        case 'AuthorizationHeader': {
          destinationHttpAuthenticationName = 'AuthorizationHeader';
          destinationHttpAuthenticationAuthorizationHeaderValue = (
            dest.authentication as TAuthorizationHeader
          ).headerValue;
          break;
        }
        case 'AzureFunctionsAuthentication': {
          destinationHttpAuthenticationName = 'AzureFunctions';
          destinationHttpAuthenticationAuthorizationKey = (
            dest.authentication as TAzureFunctionsAuthentication
          ).key;
          break;
        }
      }
      destinationHttpUrl = dest.url;
      break;
    }
    case 'AWSLambda': {
      destinationName = 'AWSLambda';
      const dest = extension?.destination as TAwsLambdaDestination;
      destinationAwsAccessKey = dest.accessKey;
      destinationAwsAccessSecret = dest.accessSecret;
      destinationAwsArn = dest.arn;
      break;
    }
  }
  const triggers: Array<TTriggerInput> =
    extension?.triggers.map((value): TTriggerInput => {
      return {
        resourceTypeId: value.resourceTypeId,
        condition: value.condition,
        actions: value.actions.map((action) => action),
      };
    }) || [];
  return {
    key: extension?.key || '',
    triggers: triggers,
    destinationName: destinationName,
    destinationHttpUrl: destinationHttpUrl,
    destinationHttpAuthenticationName: destinationHttpAuthenticationName,
    destinationHttpAuthenticationAuthorizationHeaderValue:
      destinationHttpAuthenticationAuthorizationHeaderValue,
    destinationHttpAuthenticationAuthorizationKey:
      destinationHttpAuthenticationAuthorizationKey,
    destinationAwsAccessKey: destinationAwsAccessKey,
    destinationAwsAccessSecret: destinationAwsAccessSecret,
    destinationAwsArn: destinationAwsArn,
  };
};
export const formValuesToTExtension = (
  formValues: TFormValues
): TExtensionDraft => {
  const destination: TExtensionDestinationInput = {};
  if (formValues.destinationName === 'HTTP') {
    const authentication: THttpDestinationAuthenticationInput = {};
    if (formValues.destinationHttpAuthenticationName) {
      switch (formValues.destinationHttpAuthenticationName) {
        case 'AuthorizationHeader': {
          authentication.AuthorizationHeader = {
            headerValue:
              formValues.destinationHttpAuthenticationAuthorizationHeaderValue ||
              '',
          };
          break;
        }
        case 'AzureFunctions': {
          authentication.AzureFunctions = {
            key: formValues.destinationHttpAuthenticationAuthorizationKey || '',
          };
        }
      }
    }
    destination.HTTP = {
      url: formValues.destinationHttpUrl || '',
      authentication: authentication,
    };
  } else if (formValues.destinationName === 'AWSLambda') {
    destination.AWSLambda = {
      accessKey: formValues.destinationAwsAccessKey || '',
      accessSecret: formValues.destinationAwsAccessSecret || '',
      arn: formValues.destinationAwsArn || '',
    };
  }

  return {
    key: formValues.key,
    destination: destination,
    triggers: formValues.triggers,
  };
};
