import { ApolloError, type ServerError } from '@apollo/client';
import { transformLocalizedStringToLocalizedField } from '@commercetools-frontend/l10n';
import { TCommercetoolsSubscription } from './types/generated/ctp';
import type {
  TChangeNameActionPayload,
  TGraphqlUpdateAction,
  TSyncAction,
} from './types';

export const getErrorMessage = (error: ApolloError) =>
  error.graphQLErrors?.map((e) => e.message).join('\n') || error.message;

const isServerError = (
  error: ApolloError['networkError']
): error is ServerError => {
  return Boolean((error as ServerError)?.result);
};

export const extractErrorFromGraphQlResponse = (graphQlResponse: unknown) => {
  if (graphQlResponse instanceof ApolloError) {
    if (
      isServerError(graphQlResponse.networkError) &&
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
export const convertToActionData = (
  draft: Partial<TCommercetoolsSubscription>
) => ({
  ...draft,
});

const getNameFromPayload = (payload: TChangeNameActionPayload) => ({
  name: transformLocalizedStringToLocalizedField(payload.name),
});

const isChangeNameActionPayload = (
  actionPayload: Record<string, unknown>
): actionPayload is TChangeNameActionPayload => {
  return (actionPayload as TChangeNameActionPayload)?.name !== undefined;
};

const convertAction = (action: TSyncAction): TGraphqlUpdateAction => {
  const { action: actionName, ...actionPayload } = action;

  let actionValue = actionPayload;

  switch (actionName) {
    case 'changeName': {
      if (isChangeNameActionPayload(actionPayload)) {
        actionValue = getNameFromPayload(actionPayload);
      }
      break;
    }
    case 'setDescription': {
      if ('description' in actionPayload) {
        actionValue = {
          description: transformLocalizedStringToLocalizedField(
            actionPayload.description as Record<string, string>
          ),
        };
      }
      break;
    }
    case 'changeLabel': {
      if ('fieldName' in actionPayload) {
        actionValue = {
          fieldName: actionPayload.fieldName,
          label: transformLocalizedStringToLocalizedField(
            actionPayload.label as Record<string, string>
          ),
        };
      }
      break;
    }
    default:
      console.log('no mapping defined for ' + actionName);
      break;
  }

  return {
    [actionName]: actionValue,
  };
};

export const createGraphQlUpdateActions = (actions: TSyncAction[]) =>
  actions.reduce<TGraphqlUpdateAction[]>(
    (previousActions, syncAction) => [
      ...previousActions,
      convertAction(syncAction),
    ],
    []
  );
