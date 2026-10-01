import { normalizeExpansionPaths } from './restrictions';
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
  TGoogleCloudFunctionDestination,
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
  let destinationGcfUrl = undefined;
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
    case 'GoogleCloudFunction': {
      destinationName = 'GoogleCloudFunction';
      destinationGcfUrl = (
        extension?.destination as TGoogleCloudFunctionDestination
      ).url;
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
    destinationGcfUrl: destinationGcfUrl,
    includeOldResource:
      extension?.additionalContext?.includeOldResource ?? false,
    expansionPaths: extension?.expansionPaths ?? [],
    dependencies: extension?.dependenciesRef?.map((ref) => ref.id) ?? [],
    timeoutInMs:
      extension?.timeoutInMs != null
        ? String(extension.timeoutInMs)
        : undefined,
  };
};
export const formValuesToTExtension = (
  formValues: TFormValues
): TExtensionDraft => {
  const destination: TExtensionDestinationInput = {};
  if (formValues.destinationName === 'HTTP') {
    let authentication: THttpDestinationAuthenticationInput | undefined =
      undefined;
    if (formValues.destinationHttpAuthenticationName) {
      switch (formValues.destinationHttpAuthenticationName) {
        case 'AuthorizationHeader': {
          authentication = {};
          authentication.AuthorizationHeader = {
            headerValue:
              formValues.destinationHttpAuthenticationAuthorizationHeaderValue ||
              '',
          };
          break;
        }
        case 'AzureFunctions': {
          authentication = {};
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
  } else if (formValues.destinationName === 'GoogleCloudFunction') {
    destination.GoogleCloudFunction = {
      url: formValues.destinationGcfUrl || '',
    };
  }

  const timeout = formValues.timeoutInMs?.trim();
  const expansionPaths = normalizeExpansionPaths(formValues.expansionPaths);
  const dependencies = formValues.dependencies ?? [];
  // Empty/false values are left out of the draft (the API defaults), and treated as "empty"
  // by `calculateExtensionsUpdateActions`.
  return {
    key: formValues.key,
    destination: destination,
    triggers: formValues.triggers,
    timeoutInMs: timeout ? Number(timeout) : undefined,
    expansionPaths: expansionPaths.length > 0 ? expansionPaths : undefined,
    dependencies:
      dependencies.length > 0
        ? dependencies.map((id) => ({ typeId: 'extension', id }))
        : undefined,
    additionalContext: formValues.includeOldResource
      ? { includeOldResource: true }
      : undefined,
  };
};
