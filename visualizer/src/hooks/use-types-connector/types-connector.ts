import { ApolloError, OperationVariables } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell-connectors';
import { createSyncTypes, DeepPartial } from '@commercetools/sync-actions';
import { Type } from '@commercetools/platform-sdk';
import {
  TMutation,
  TMutation_CreateTypeDefinitionArgs,
  TMutation_DeleteTypeDefinitionArgs,
  TMutation_UpdateTypeDefinitionArgs,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TQuery_TypeDefinitionsArgs,
  TTypeUpdateAction,
} from '../../types/generated/ctp';
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
import TypeWithDefinitionByName from './fetch-type-definition-field-by-name.graphql';
import {
  convertToActionData,
  PickedFieldDefinition,
  PickedTypeDefinition,
} from './conversion';

const syncTypes = createSyncTypes();

export type QueryOptions = {
  skip?: boolean;
  onCompleted?: (data: TQuery) => void;
  onError?: (error: ApolloError) => void;
};

export const useTypeDefinitionsFetcher = (
  variables: TQuery_TypeDefinitionsArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_TypeDefinitionsArgs & OperationVariables
  >(FetchAllQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    typeDefinitions: data?.typeDefinitions,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useTypeDefinitionFetcher = (
  variables: TQuery_TypeDefinitionArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_TypeDefinitionArgs & OperationVariables
  >(FetchQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    typeDefinition: data?.typeDefinition,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useTypeDefinitionCreator = () => {
  const [createTypeDefinition, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateTypeDefinitionArgs
  >(CreateMutation);

  const execute = async (variables: TMutation_CreateTypeDefinitionArgs) => {
    try {
      return await createTypeDefinition({
        variables,
        context: mcApiContext,
      }).then(({ data, errors, extensions }) => ({
        createTypeDefinition: data?.createTypeDefinition,
        errors,
        extensions,
      }));
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const useTypeDefinitionDeleter = () => {
  const [deleteTypeDefinition, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteTypeDefinitionArgs
  >(DeleteMutation);

  const execute = async (variables: TMutation_DeleteTypeDefinitionArgs) => {
    try {
      return await deleteTypeDefinition({
        variables,
        context: mcApiContext,
      }).then(({ data, errors, extensions }) => ({
        deleteTypeDefinition: data?.deleteTypeDefinition,
        errors,
        extensions,
      }));
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const useTypeDefinitionUpdater = () => {
  const [updateTypeDefinition, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateTypeDefinitionArgs
  >(UpdateMutation);

  const execute = async (variables: TMutation_UpdateTypeDefinitionArgs) => {
    try {
      return await updateTypeDefinition({
        variables,
        context: mcApiContext,
      }).then(({ data, errors, extensions }) => ({
        updateTypeDefinition: data?.updateTypeDefinition,
        errors,
        extensions,
      }));
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
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
    TQuery_TypeDefinitionWithDefinitionByNameArgs & OperationVariables
  >(TypeWithDefinitionByName, {
    variables,
    context: mcApiContext,
  });

  return {
    fieldDefinitions: data?.typeDefinition?.fieldDefinitions,
    version: data?.typeDefinition?.version,
    error,
    loading,
    refetch,
  };
};

export const calculateTypeDefinitionUpdateActions = (
  originalDraft: PickedTypeDefinition,
  nextDraft: PickedTypeDefinition
) => {
  const originalConverted = convertToActionData(originalDraft, true);
  const nextConverted = convertToActionData(nextDraft, true);
  const actions = syncTypes.buildActions(nextConverted, originalConverted);
  return createGraphQlUpdateActions(actions) as Array<TTypeUpdateAction>;
};

export const calculateFieldDefinitionUpdateActions = (
  originalDraft: PickedFieldDefinition,
  nextDraft: PickedFieldDefinition
) => {
  const wrappedOriginalDraft = convertToActionData(
    {
      fieldDefinitions: [originalDraft],
    },
    false
  );
  const wrappedNextDraft: DeepPartial<Type> = convertToActionData(
    {
      fieldDefinitions: [nextDraft],
    },
    false
  );

  const actions = syncTypes.buildActions(
    wrappedNextDraft,
    wrappedOriginalDraft
  );
  return createGraphQlUpdateActions(actions) as Array<TTypeUpdateAction>;
};
