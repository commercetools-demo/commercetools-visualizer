import {
  Maybe,
  TMutation,
  TMutation_CreateTypeDefinitionArgs,
  TMutation_DeleteTypeDefinitionArgs,
  TMutation_UpdateTypeDefinitionArgs,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TQuery_TypeDefinitionsArgs,
  TTypeDefinition,
  TTypeDefinitionDraft,
  TTypeDefinitionQueryResult,
} from '../../types/generated/ctp';
import { ApolloError, ApolloQueryResult, useQuery } from '@apollo/client';
import FetchTypeDefinitionsQuery from './fetch-types.ctp.graphql';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import CreateTypeDefinitionMutation from './create-type.ctp.graphql';
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
} from '../../helpers';
import UpdateTypeDefinitionIdMutation from './update-type.ctp.graphql';
import { convertToActionData } from '../../components/types/type-definition-connectors';
import { createSyncTypes } from '@commercetools/sync-actions';
import DeleteQuery from './delete-type-definition-id.ctp.graphql';
import FetchQuery from './fetch-type.ctp.graphql';
const syncTypes = createSyncTypes();

export const useTypeDefinitionCreator = () => {
  const [createTypeDefinition, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateTypeDefinitionArgs
  >(CreateTypeDefinitionMutation);

  const execute = async ({ draft }: { draft: TTypeDefinitionDraft }) => {
    try {
      return await createTypeDefinition({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          draft: draft,
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

export const useTypeDefinitionUpdater = () => {
  const [updateTypeDefinitionId, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateTypeDefinitionArgs
  >(UpdateTypeDefinitionIdMutation);

  const execute = async ({
    originalDraft,
    nextDraft,
  }: {
    originalDraft: Partial<TTypeDefinition>;
    nextDraft: any;
  }) => {
    try {
      console.log(nextDraft, convertToActionData(originalDraft));
      const actions = syncTypes.buildActions(
        {
          ...nextDraft,
          fieldDefinitions: nextDraft.fieldDefinitions
            ? nextDraft.fieldDefinitions
            : [],
        },
        convertToActionData(originalDraft)
      );

      return await updateTypeDefinitionId({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: originalDraft.id,
          version: originalDraft.version || 1,
          actions: createGraphQlUpdateActions(actions),
        },
      });
    } catch (graphQlResponse) {
      console.log(graphQlResponse);
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

type TUseTypesFetcher = (variables: TQuery_TypeDefinitionsArgs) => {
  typeDefinitions?: TTypeDefinitionQueryResult;
  error?: ApolloError;
  loading: boolean;
  refetch(): Promise<ApolloQueryResult<TQuery>>;
};
export const useTypesFetcher: TUseTypesFetcher = (variables) => {
  const { data, error, loading, refetch } = useQuery<
    TQuery,
    TQuery_TypeDefinitionsArgs
  >(FetchTypeDefinitionsQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    typeDefinitions: data?.typeDefinitions,
    error,
    loading,
    refetch,
  };
};

type TUseTypeDefinitionFetcher = (props: { id: string }) => {
  typeDefinition?: Maybe<TTypeDefinition>;
  error?: ApolloError;
  loading: boolean;
  refetch: (
    variables?: Partial<TQuery_TypeDefinitionArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

export const useTypeDefinitionFetcher: TUseTypeDefinitionFetcher = ({ id }) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_TypeDefinitionArgs
  >(FetchQuery, {
    variables: {
      id: id,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    typeDefinition: data?.typeDefinition,
    error,
    loading,
    refetch,
  };
};

export const useTypeDefinitionDeleter = () => {
  const [deleteTypeDefinitionById, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteTypeDefinitionArgs
  >(DeleteQuery);

  const execute = async ({
    id,
    key,
    version,
  }: TMutation_DeleteTypeDefinitionArgs) => {
    try {
      return await deleteTypeDefinitionById({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: id,
          key: key,
          version: version,
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
