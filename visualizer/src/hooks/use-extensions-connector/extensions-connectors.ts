import {
  TExtension,
  TExtensionDraft,
  TExtensionUpdateAction,
  TMutation,
  TMutation_CreateExtensionArgs,
  TMutation_DeleteExtensionArgs,
  TMutation_UpdateExtensionArgs,
  TQuery,
  TQuery_ExtensionArgs,
  TQuery_ExtensionsArgs,
  TTriggerInput,
} from '../../types/generated/ctp';
import { useQuery } from '@apollo/client';
import FetchExtensionsQuery from './fetch-extensions.cpt.graphql';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import FetchQuery from './fetch-extension.cpt.graphql';
import UpdateExtension from './update-extension.ctp.graphql';
import {
  compareStringArrays,
  extractErrorFromGraphQlResponse,
} from '../../helpers';
import DeleteQuery from './delete-extension.ctp.graphql';
import CreateQuery from './create-extension.ctp.graphql';

export const useExtensionCreator = () => {
  const [createSubscription, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateExtensionArgs
  >(CreateQuery);

  const execute = async (variables: TMutation_CreateExtensionArgs) => {
    try {
      return await createSubscription({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: variables,
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

export const useExtensionsFetcher = (variables: TQuery_ExtensionsArgs) => {
  const { data, error, loading, refetch } = useQuery<
    TQuery,
    TQuery_ExtensionsArgs
  >(FetchExtensionsQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    extensions: data?.extensions,
    error,
    loading,
    refetch,
  };
};

export const useExtensionFetcher = (variables: TQuery_ExtensionArgs) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_ExtensionArgs
  >(FetchQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    extension: data?.extension,
    error,
    loading,
    refetch,
  };
};

export const useExtensionUpdater = () => {
  const [updateExtension, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateExtensionArgs
  >(UpdateExtension);

  const execute = async ({
    originalDraft,
    nextDraft,
    id,
    version,
  }: {
    originalDraft: TExtension;
    nextDraft: TExtensionDraft;
    id: string;
    version: number;
  }) => {
    try {
      const actions: Array<TExtensionUpdateAction> = [];
      //change key if required
      if (nextDraft.key && originalDraft.key !== nextDraft.key) {
        actions.push({ setKey: { key: nextDraft.key } });
      }

      //change triggers if required
      if (nextDraft.triggers) {
        const originalResourceTypes = originalDraft.triggers.map(
          (value) => value.resourceTypeId
        );
        const nextResourceTypes = nextDraft.triggers.map(
          (value) => value.resourceTypeId
        );
        const changeTriggersAction = {
          changeTriggers: {
            triggers: nextDraft.triggers.map(
              (message): TTriggerInput => ({
                resourceTypeId: message.resourceTypeId,
                actions: message.actions,
                condition: message.condition,
              })
            ),
          },
        };

        if (!compareStringArrays(originalResourceTypes, nextResourceTypes)) {
          actions.push(changeTriggersAction);
        } else {
          for (const value of nextDraft.triggers) {
            const nextResourceId = value.resourceTypeId;

            const originalTrigger = originalDraft.triggers.find(
              (value) => value.resourceTypeId === nextResourceId
            );
            if (
              !compareStringArrays(
                value.actions?.map((value) => value as string),
                originalTrigger?.actions.map((value) => value as string)
              )
            ) {
              actions.push(changeTriggersAction);
              break;
            }
            if (
              (!value.condition && originalTrigger?.condition) ||
              (value.condition && !originalTrigger?.condition) ||
              value.condition !== originalTrigger?.condition
            ) {
              actions.push(changeTriggersAction);
              break;
            }
          }
        }
      }

      return await updateExtension({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: id,
          version: version || 1,
          actions: actions,
        },
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

export const useExtensionDeleter = () => {
  const [deleteExtension, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteExtensionArgs
  >(DeleteQuery);

  const execute = async (variables: TMutation_DeleteExtensionArgs) => {
    try {
      return await deleteExtension({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: variables,
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};
