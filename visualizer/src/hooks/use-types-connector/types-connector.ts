import {
  TFieldDefinition,
  TFieldDefinitionInput,
  TMutation,
  TMutation_CreateTypeDefinitionArgs,
  TMutation_DeleteTypeDefinitionArgs,
  TMutation_UpdateTypeDefinitionArgs,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TQuery_TypeDefinitionsArgs,
  TTypeDefinition,
} from '../../types/generated/ctp';
import { useQuery } from '@apollo/client';
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
import {
  convertFieldDefinitionToActionData,
  convertToActionData,
} from '../../components/types/type-definition-connectors';
import { createSyncTypes } from '@commercetools/sync-actions';
import DeleteQuery from './delete-type-definition-id.ctp.graphql';
import FetchQuery from './fetch-type.ctp.graphql';
import TypeWithDefinitionByName from './fetch-type-definition-field-by-name.ctp.graphql';

const syncTypes = createSyncTypes();

export const useTypeDefinitionCreator = () => {
  const [createTypeDefinition, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateTypeDefinitionArgs
  >(CreateTypeDefinitionMutation);

  const execute = async (variables: TMutation_CreateTypeDefinitionArgs) => {
    try {
      return await createTypeDefinition({
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

export const useTypeUpdater = () => {
  const [updateTypeId, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateTypeDefinitionArgs
  >(UpdateTypeDefinitionIdMutation);

  const execute = async ({
    originalDraft,
    nextDraft,
    id,
    version,
  }: {
    originalDraft: TTypeDefinition;
    nextDraft: any;
    id: string;
    version: number;
  }) => {
    try {
      const originalConverted = convertToActionData(originalDraft, true);
      const actions = syncTypes.buildActions(nextDraft, originalConverted);

      return await updateTypeId({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: id,
          version: version || 1,
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

export const useTypeDefinitionUpdater = () => {
  const [updateTypeDefinitionId, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateTypeDefinitionArgs
  >(UpdateTypeDefinitionIdMutation);

  const execute = async ({
    originalDraft,
    nextDraft,
    id,
    version,
  }: {
    originalDraft: TFieldDefinition;
    nextDraft: Partial<TFieldDefinitionInput>;
    id: string;
    version: number;
  }) => {
    try {
      let originalDraft1 = convertToActionData({
        fieldDefinitions: [originalDraft],
      });
      let nextDraft1 = {
        fieldDefinitions: [convertFieldDefinitionToActionData(nextDraft)],
      };

      const actions = syncTypes.buildActions(nextDraft1, originalDraft1);

      return await updateTypeDefinitionId({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: id,
          version: version || 1,
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

export const useTypesFetcher = (variables: TQuery_TypeDefinitionsArgs) => {
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

export const useTypeDefinitionFetcher = (
  variables: TQuery_TypeDefinitionArgs
) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_TypeDefinitionArgs
  >(FetchQuery, {
    variables: variables,
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

  const execute = async (variables: TMutation_DeleteTypeDefinitionArgs) => {
    try {
      return await deleteTypeDefinitionById({
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
export const useTypeDefinitionEntryCreator = () => {
  const [createTypeDefinitionEntry, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateTypeDefinitionArgs
  >(UpdateTypeDefinitionIdMutation);

  const execute = async (variables: TMutation_UpdateTypeDefinitionArgs) => {
    try {
      return await createTypeDefinitionEntry({
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
export type TQuery_TypeDefinitionWithDefinitionByNameArgs = {
  id: string;
  includeNames: Array<string>;
};
export const useTypeWithDefinitionByNameFetcher = (
  variables: TQuery_TypeDefinitionWithDefinitionByNameArgs
) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_TypeDefinitionWithDefinitionByNameArgs
  >(TypeWithDefinitionByName, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    fieldDefinitions: data?.typeDefinition?.fieldDefinitions,
    version: data?.typeDefinition?.version,
    error,
    loading,
    refetch,
  };
};
