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
  ExtensionUpdateAction,
} from '@commercetools/platform-sdk';
import {
  TActionType,
  TExtension,
  TExtensionDraft,
  TExtensionUpdateAction,
  TAwsLambdaDestination,
  TGoogleCloudFunctionDestination,
  THttpDestination,
  TMutation,
  TMutation_CreateExtensionArgs,
  TMutation_DeleteExtensionArgs,
  TMutation_UpdateExtensionArgs,
  TQuery,
  TQuery_ExtensionArgs,
  TQuery_ExtensionsArgs,
} from '../../types/generated/ctp';
import type { DependencyCandidate } from '../../components/extensions/extensions-form/restrictions';
import { mcApiContext } from '../shared/mc-api-context';
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
} from '../shared/graphql-helpers';
import FetchAllQuery from './fetch-all.graphql';
import FetchQuery from './fetch.graphql';
import FetchDependencyCandidatesQuery from './fetch-dependency-candidates.graphql';
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
  Pick<Extension, 'key' | 'destination' | 'triggers' | 'timeoutInMs'>
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
  } else if (draft.destination.AWSLambda) {
    const { arn, accessKey, accessSecret } = draft.destination.AWSLambda;
    mappedDestination = { type: 'AWSLambda', arn, accessKey, accessSecret };
  } else if (draft.destination.GoogleCloudFunction) {
    mappedDestination = {
      type: 'GoogleCloudFunction',
      url: draft.destination.GoogleCloudFunction.url,
    };
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
      break;
    }
    case 'AWSLambda': {
      const dest = draft.destination as TAwsLambdaDestination;
      mappedDestination = {
        type: 'AWSLambda',
        arn: dest.arn,
        accessKey: dest.accessKey,
        accessSecret: dest.accessSecret,
      };
      break;
    }
    case 'GoogleCloudFunction': {
      mappedDestination = {
        type: 'GoogleCloudFunction',
        url: (draft.destination as TGoogleCloudFunctionDestination).url,
      };
      break;
    }
  }
  return mappedDestination;
};

const convertTExtensionDraft = (draft: TExtensionDraft): PickedReturnType => {
  return {
    destination: convertTExtensionDraftDestination(draft),
    key: draft.key || undefined,
    timeoutInMs: draft.timeoutInMs ?? undefined,
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
    timeoutInMs: draft.timeoutInMs ?? undefined,
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

// `@commercetools/sync-actions`' extension sync (`baseActionsList` in its source) only knows
// setKey/changeTriggers/setTimeoutInMs/changeDestination. It never emits setDependencies,
// setExpansionPaths or setAdditionalContext, so changes to them are diffed here. Missing
// values count as "empty" (no dependencies, no paths, includeOldResource false), the way the
// API returns/treats them.
const sortedIds = (ids: ReadonlyArray<string>) => [...ids].sort();

const calculateExtraActions = (
  originalDraft: TExtension,
  nextDraft: TExtensionDraft
) => {
  const actions: Array<Record<string, unknown>> = [];

  const originalDependencies = sortedIds(
    (originalDraft.dependenciesRef ?? []).map((ref) => ref.id)
  );
  const nextDependencies = sortedIds(
    (nextDraft.dependencies ?? []).flatMap((ref) => (ref.id ? [ref.id] : []))
  );
  if (
    JSON.stringify(originalDependencies) !== JSON.stringify(nextDependencies)
  ) {
    actions.push({
      action: 'setDependencies',
      dependencies: (nextDraft.dependencies ?? []).map((ref) => ({
        typeId: 'extension',
        id: ref.id,
      })),
    });
  }

  const originalPaths = sortedIds(originalDraft.expansionPaths ?? []);
  const nextPaths = sortedIds(nextDraft.expansionPaths ?? []);
  if (JSON.stringify(originalPaths) !== JSON.stringify(nextPaths)) {
    actions.push({
      action: 'setExpansionPaths',
      expansionPaths: nextDraft.expansionPaths ?? [],
    });
  }

  const originalIncludeOld =
    originalDraft.additionalContext?.includeOldResource ?? false;
  const nextIncludeOld =
    nextDraft.additionalContext?.includeOldResource ?? false;
  if (originalIncludeOld !== nextIncludeOld) {
    actions.push({
      action: 'setAdditionalContext',
      additionalContext: { includeOldResource: nextIncludeOld },
    });
  }

  return actions;
};

export const calculateExtensionsUpdateActions = (
  originalDraft: TExtension,
  nextDraft: TExtensionDraft
) => {
  // `@commercetools/sync-actions` depends on a newer `@commercetools/platform-sdk`
  // than this app does, so its inferred `ExtensionUpdateAction` return type
  // includes action variants (e.g. `ExtensionSetAdditionalContextAction`) our
  // own version's type doesn't know about, which TS then can't match against
  // `createGraphQlUpdateActions`'s parameter — reassert our own version's type.
  const httpActions = syncApiExtensions.buildActions(
    convertTExtensionDraft(nextDraft),
    convertTExtension(originalDraft)
  ) as Array<ExtensionUpdateAction>;
  return createGraphQlUpdateActions([
    ...httpActions,
    // The platform SDK version we depend on has no types for these actions.
    ...(calculateExtraActions(
      originalDraft,
      nextDraft
    ) as unknown as typeof httpActions),
  ]) as TExtensionUpdateAction[];
};

// The other Extensions of the project, for picking dependencies (see restrictions.ts).
export const useExtensionDependencyCandidates = () => {
  const { data, error, loading } = useMcQuery<TQuery>(
    FetchDependencyCandidatesQuery,
    { context: mcApiContext }
  );
  const candidates: Array<DependencyCandidate> | undefined =
    data?.extensions.results.map((extension) => ({
      id: extension.id,
      key: extension.key,
      triggers: extension.triggers,
      dependencyIds: extension.dependenciesRef.map((ref) => ref.id),
    }));
  return { candidates, error, loading };
};
