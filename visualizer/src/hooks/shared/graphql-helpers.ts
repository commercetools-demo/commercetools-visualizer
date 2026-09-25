import { ApolloError, isApolloError, type ServerError } from '@apollo/client';
import {
  transformLocalizedFieldToLocalizedString as l10nTransformLocalizedFieldToLocalizedString,
  transformLocalizedStringToLocalizedField,
} from '@commercetools-frontend/l10n';
import { LocalizedField } from '@commercetools-frontend/l10n/dist/declarations/src/types';
import { Destination, ExtensionDestination } from '@commercetools/sync-actions';
import {
  ExtensionUpdateAction,
  StateUpdateAction,
  SubscriptionUpdateAction,
  TypeUpdateAction,
} from '@commercetools/platform-sdk';
import {
  TAwsAuthenticationMode,
  TChangeExtensionDestination,
  TChangeSubscriptionDestination,
  TExtensionUpdateAction,
  THttpDestinationInput,
  TStateUpdateAction,
  TTypeUpdateAction,
  TSubscriptionUpdateAction,
} from '../../types/generated/ctp';

export const getErrorMessage = (error: ApolloError) =>
  error.graphQLErrors?.map((e) => e.message).join('\n') || error.message;

const isServerError = (
  error: ApolloError['networkError']
): error is ServerError => {
  return Boolean((error as ServerError)?.result);
};

export const extractErrorFromGraphQlResponse = (graphQlResponse: unknown) => {
  if (graphQlResponse instanceof Error && isApolloError(graphQlResponse)) {
    if (
      isServerError(graphQlResponse.networkError) &&
      typeof graphQlResponse.networkError?.result !== 'string' &&
      graphQlResponse.networkError?.result?.errors.length > 0
    ) {
      return graphQlResponse?.networkError?.result.errors;
    }

    if (graphQlResponse.graphQLErrors?.length > 0) {
      return graphQlResponse.graphQLErrors;
    }
  }

  return graphQlResponse;
};

export const transformLocalizedFieldToLocalizedString = (
  localizedFields?: LocalizedField[] | null
) => {
  return (
    l10nTransformLocalizedFieldToLocalizedString(localizedFields || []) || {}
  );
};

export type LocalizedString = { [key: string]: string };

export type TSetNameActionPayload = {
  name: LocalizedString;
};

export type TChangeNameActionPayload = {
  name: LocalizedString;
};

export type TSetDescriptionActionPayload = {
  description: LocalizedString;
};

export type TChangeLabelActionPayload = {
  fieldName: string;
  label: LocalizedString;
};

export type TChangeLocalizedEnumValueLabelActionPayload = {
  fieldName: string;
  value: { key: string; label: LocalizedString };
};

export type TChangeDestinationActionPayload = {
  destination: ExtensionDestination | Destination;
};

const getDestinationFromPayload = (
  payload: TChangeDestinationActionPayload
) => {
  let result:
    | TChangeExtensionDestination
    | TChangeSubscriptionDestination
    | undefined = undefined;
  switch (payload.destination.type) {
    case 'HTTP': {
      let http: THttpDestinationInput = { url: payload.destination.url };
      if (payload.destination.authentication) {
        switch (payload.destination.authentication.type) {
          case 'AuthorizationHeader': {
            http = {
              ...http,
              authentication: {
                AuthorizationHeader: {
                  headerValue: payload.destination.authentication.headerValue,
                },
              },
            };
            break;
          }
          case 'AzureFunctions': {
            http = {
              ...http,
              authentication: {
                AzureFunctions: {
                  key: payload.destination.authentication.key,
                },
              },
            };
            break;
          }
        }
      }
      result = { destination: { HTTP: http } };
      break;
    }
    case 'AWSLambda': {
      result = {
        destination: {
          AWSLambda: {
            accessKey: payload.destination.accessKey,
            accessSecret: payload.destination.accessSecret,
            arn: payload.destination.arn,
          },
        },
      };
      break;
    }
    case 'GoogleCloudFunction': {
      result = {
        destination: { GoogleCloudFunction: { url: payload.destination.url } },
      };
      break;
    }
    case 'GoogleCloudPubSub': {
      result = {
        destination: {
          GoogleCloudPubSub: {
            projectId: payload.destination.projectId,
            topic: payload.destination.topic,
          },
        },
      };
      break;
    }
    case 'SQS': {
      result = {
        destination: {
          SQS: {
            accessKey: payload.destination.accessKey,
            accessSecret: payload.destination.accessSecret,
            authenticationMode:
              payload.destination.authenticationMode === 'IAM'
                ? TAwsAuthenticationMode.Iam
                : TAwsAuthenticationMode.Credentials,
            queueUrl: payload.destination.queueUrl,
            region: payload.destination.region,
          },
        },
      };
      break;
    }
    case 'ConfluentCloud': {
      result = {
        destination: {
          ConfluentCloud: {
            acks: payload.destination.acks,
            apiKey: payload.destination.apiKey,
            apiSecret: payload.destination.apiSecret,
            bootstrapServer: payload.destination.bootstrapServer,
            topic: payload.destination.topic,
          },
        },
      };
      break;
    }
  }
  return result;
};

const getNameFromPayload = (payload: TChangeNameActionPayload) => ({
  name: transformLocalizedStringToLocalizedField(payload.name),
});

const getDescriptionFromPayload = (payload: TSetDescriptionActionPayload) => ({
  description: transformLocalizedStringToLocalizedField(payload.description),
});
const getLabelFromPayload = (payload: TChangeLabelActionPayload) => ({
  fieldName: payload.fieldName,
  label: transformLocalizedStringToLocalizedField(payload.label),
});
const getChangeLocalizedEnumValueFromPayload = (
  payload: TChangeLocalizedEnumValueLabelActionPayload
) => {
  return {
    fieldName: payload.fieldName,
    value: {
      key: payload.value.key,
      label: transformLocalizedStringToLocalizedField(payload.value.label),
    },
  };
};

const isChangeDestinationPayload = (
  actionPayload: Record<string, unknown>
): actionPayload is TChangeDestinationActionPayload => {
  return (
    (actionPayload as TChangeDestinationActionPayload)?.destination !==
    undefined
  );
};

const isSetNameActionPayload = (
  actionPayload: Record<string, unknown>
): actionPayload is TSetNameActionPayload => {
  return (actionPayload as TSetNameActionPayload)?.name !== undefined;
};
const isChangeNameActionPayload = (
  actionPayload: Record<string, unknown>
): actionPayload is TChangeNameActionPayload => {
  return (actionPayload as TChangeNameActionPayload)?.name !== undefined;
};
const isSetDescriptionActionPayload = (
  actionPayload: Record<string, unknown>
): actionPayload is TSetDescriptionActionPayload => {
  return (
    (actionPayload as TSetDescriptionActionPayload)?.description !== undefined
  );
};
const isChangeLabelActionPayload = (
  actionPayload: Record<string, unknown>
): actionPayload is TChangeLabelActionPayload => {
  return (actionPayload as TChangeLabelActionPayload)?.label !== undefined;
};
const isUpdateLocalizedEnumValueLabel = (
  actionPayload: Record<string, unknown>
): actionPayload is TChangeLocalizedEnumValueLabelActionPayload => {
  return (
    (actionPayload as TChangeLocalizedEnumValueLabelActionPayload)
      ?.fieldName !== undefined &&
    (actionPayload as TChangeLocalizedEnumValueLabelActionPayload)?.value !==
      undefined
  );
};

const convertAction = (
  action:
    | TypeUpdateAction
    | StateUpdateAction
    | ExtensionUpdateAction
    | SubscriptionUpdateAction
):
  | TStateUpdateAction
  | TTypeUpdateAction
  | TExtensionUpdateAction
  | TSubscriptionUpdateAction => {
  const { action: actionName, ...actionPayload } = action;
  let actionPL: object = actionPayload;
  switch (actionName) {
    case 'changeDestination': {
      if (isChangeDestinationPayload(actionPayload)) {
        const newPayload = getDestinationFromPayload(actionPayload);
        if (newPayload) {
          actionPL = newPayload;
        }
      }
      break;
    }
    case 'setName': {
      if (isSetNameActionPayload(actionPayload)) {
        actionPL = getNameFromPayload(actionPayload);
      }
      break;
    }
    case 'changeName': {
      if (isChangeNameActionPayload(actionPayload)) {
        actionPL = getNameFromPayload(actionPayload);
      }
      break;
    }
    case 'setDescription': {
      if (isSetDescriptionActionPayload(actionPayload)) {
        actionPL = getDescriptionFromPayload(actionPayload);
      }
      break;
    }
    case 'changeLocalizedEnumValueLabel': {
      if (isUpdateLocalizedEnumValueLabel(actionPayload)) {
        actionPL = getChangeLocalizedEnumValueFromPayload(actionPayload);
      }
      break;
    }
    case 'addLocalizedEnumValue': {
      if (isUpdateLocalizedEnumValueLabel(actionPayload)) {
        actionPL = getChangeLocalizedEnumValueFromPayload(actionPayload);
      }
      break;
    }
    case 'changeLabel': {
      if (isChangeLabelActionPayload(actionPayload)) {
        actionPL = getLabelFromPayload(actionPayload);
      }
      break;
    }
  }
  return {
    [actionName]: actionPL,
  };
};

export const createGraphQlUpdateActions = (
  actions: (
    | TypeUpdateAction
    | StateUpdateAction
    | ExtensionUpdateAction
    | SubscriptionUpdateAction
  )[]
) =>
  actions.reduce<
    (
      | TStateUpdateAction
      | TTypeUpdateAction
      | TExtensionUpdateAction
      | TSubscriptionUpdateAction
    )[]
  >(
    (previousActions, syncAction) => [
      ...previousActions,
      convertAction(syncAction),
    ],
    []
  );
