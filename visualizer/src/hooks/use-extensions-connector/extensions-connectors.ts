import { ApolloError, OperationVariables } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell-connectors';
import { createSyncApiExtensions } from '@commercetools/sync-actions';
import {
  AuthorizationHeaderAuthentication,
  AzureFunctionsAuthentication,
  Extension,
  ExtensionDestination,
} from '@commercetools/platform-sdk';
import {
  TActionType,
  TExtension,
  TExtensionDraft,
  TExtensionUpdateAction,
  THttpDestination,
  TMutation,
  TMutation_CreateExtensionArgs,
  TMutation_DeleteExtensionArgs,
  TMutation_UpdateExtensionArgs,
  TQuery,
  TQuery_ExtensionArgs,
  TQuery_ExtensionsArgs,
} from 'commercetools-demo-shared-helpers';
import { mcApiContext } from '../shared/mc-api-context';
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
} from '../shared/graphql-helpers';
import FetchAllQuery from './fetch-all.graphql';
import FetchQuery from './fetch.graphql';
import CreateMutation from './create.graphql';
import UpdateMutation from './update.graphql';
import DeleteMutation from './delete.graphql';

const syncApiExtensions = createSyncApiExtensions();

export type QueryOptions = {
  skip?: boolean;
  onCompleted?: (data: TQuery) => void;
  onError?: (error: ApolloError) => void;
};

type PickedReturnType = Partial<
  Pick<Extension, 'key' | 'destination' | 'triggers'>
>;

const convertTExtensionDraftDestination = (draft: TExtensionDraft) => {
  let mappedDestination: ExtensionDestination | undefined = undefined;
  if (draft.destination.HTTP) {
    const httpDestination = draft.destination.HTTP;
    mappedDestination = {
      type: 'HTTP',
      url: httpDestination.url,
    };
    if (httpDestination.authentication) {
      if (httpDestination.authentication.AuthorizationHeader) {
        mappedDestination = {
          ...mappedDestination,
          authentication: {
            type: 'AuthorizationHeader',
            headerValue:
              httpDestination.authentication.AuthorizationHeader.headerValue,
          },
        };
      } else if (httpDestination.authentication.AzureFunctions) {
        mappedDestination = {
          ...mappedDestination,
          authentication: {
            type: 'AzureFunctions',
            key: httpDestination.authentication.AzureFunctions.key,
          },
        };
      }
    }
  }
  return mappedDestination;
};

const convertTExtensionDestination = (draft: TExtension) => {
  let mappedDestination: ExtensionDestination | undefined = undefined;
  switch (draft.destination.type) {
    case 'HTTP': {
      const dest = draft.destination as THttpDestination;
      mappedDestination = { type: 'HTTP', url: dest.url };
      if (dest.authentication) {
        switch (dest.authentication.type) {
          case 'AuthorizationHeader': {
            mappedDestination = {
              ...mappedDestination,
              authentication: {
                type: 'AuthorizationHeader',
                headerValue: (
                  dest.authentication as AuthorizationHeaderAuthentication
                ).headerValue,
              },
            };
            break;
          }
          case 'AzureFunctions': {
            mappedDestination = {
              ...mappedDestination,
              authentication: {
                type: 'AzureFunctions',
                key: (dest.authentication as AzureFunctionsAuthentication).key,
              },
            };
          }
        }
      }
    }
  }
  return mappedDestination;
};

const convertTExtensionDraft = (draft: TExtensionDraft): PickedReturnType => {
  return {
    destination: convertTExtensionDraftDestination(draft),
    key: draft.key || undefined,
    triggers: draft.triggers.map((trigger) => {
      return {
        resourceTypeId: trigger.resourceTypeId,
        actions:
          trigger.actions?.map((action) => {
            switch (action) {
              case TActionType.Create: {
                return 'Create';
              }
              case TActionType.Update: {
                return 'Update';
              }
              default:
                return 'Create';
            }
          }) || [],
        condition: trigger.condition || undefined,
      };
    }),
  };
};

const convertTExtension = (draft: TExtension): PickedReturnType => {
  return {
    destination: convertTExtensionDestination(draft),
    key: draft.key || undefined,
    triggers: draft.triggers.map((trigger) => {
      return {
        resourceTypeId: trigger.resourceTypeId,
        actions: trigger.actions?.map((action) => action.toString()),
        condition: trigger.condition || undefined,
      };
    }),
  };
};

export const useExtensionsFetcher = (
  variables: TQuery_ExtensionsArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_ExtensionsArgs & OperationVariables
  >(FetchAllQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    extensions: data?.extensions,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useExtensionFetcher = (
  variables: TQuery_ExtensionArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_ExtensionArgs & OperationVariables
  >(FetchQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    extension: data?.extension,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useExtensionCreator = () => {
  const [createExtension, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateExtensionArgs
  >(CreateMutation);

  const execute = async (variables: TMutation_CreateExtensionArgs) => {
    try {
      return await createExtension({ variables, context: mcApiContext }).then(
        ({ data, errors, extensions }) => ({
          createExtension: data?.createExtension,
          errors,
          extensions,
        })
      );
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const useExtensionUpdater = () => {
  const [updateExtension, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateExtensionArgs
  >(UpdateMutation);

  const execute = async (variables: TMutation_UpdateExtensionArgs) => {
    try {
      return await updateExtension({ variables, context: mcApiContext }).then(
        ({ data, errors, extensions }) => ({
          updateExtension: data?.updateExtension,
          errors,
          extensions,
        })
      );
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const useExtensionDeleter = () => {
  const [deleteExtension, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteExtensionArgs
  >(DeleteMutation);

  const execute = async (variables: TMutation_DeleteExtensionArgs) => {
    try {
      return await deleteExtension({ variables, context: mcApiContext }).then(
        ({ data, errors, extensions }) => ({
          deleteExtension: data?.deleteExtension,
          errors,
          extensions,
        })
      );
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const calculateExtensionsUpdateActions = (
  originalDraft: TExtension,
  nextDraft: TExtensionDraft
) => {
  const httpActions = syncApiExtensions.buildActions(
    convertTExtensionDraft(nextDraft),
    convertTExtension(originalDraft)
  );
  return createGraphQlUpdateActions(httpActions) as TExtensionUpdateAction[];
};
