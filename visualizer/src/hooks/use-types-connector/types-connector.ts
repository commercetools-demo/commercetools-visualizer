import { ApolloError, OperationVariables } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell-connectors';
import { createSyncTypes, DeepPartial } from '@commercetools/sync-actions';
import { Type, TypeUpdateAction } from '@commercetools/platform-sdk';
import {
  TEnumType,
  TFieldDefinition,
  TLocalizedEnumType,
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
  // `@commercetools/sync-actions` depends on a newer `@commercetools/platform-sdk`
  // than this app does, so its inferred `TypeUpdateAction` return type includes
  // action variants (e.g. `TypeRemoveEnumValuesAction`) our own version's type
  // doesn't know about, which TS then can't match against `createGraphQlUpdateActions`'s
  // parameter — reassert our own version's type.
  const actions = syncTypes.buildActions(
    nextConverted,
    originalConverted
  ) as Array<TypeUpdateAction>;
  return createGraphQlUpdateActions(actions) as Array<TTypeUpdateAction>;
};

// `convertToActionData(draft, true)` deliberately ignores fieldDefinitions
// (see calculateTypeDefinitionUpdateActions above) — adding/editing a field
// definition is handled by its own dedicated create/edit flow, which
// persists immediately. Removing one, though, is staged in the type form's
// own Formik state (so it goes through the same Save/Revert as
// key/name/description), so it needs its own diff here, by field name.
export const calculateFieldDefinitionRemovals = (
  originalFieldDefinitions: Array<TFieldDefinition>,
  nextFieldDefinitions: Array<TFieldDefinition>
): Array<TTypeUpdateAction> => {
  const nextNames = new Set(nextFieldDefinitions.map((field) => field.name));
  return originalFieldDefinitions
    .filter((field) => !nextNames.has(field.name))
    .map((field) => ({ removeFieldDefinition: { fieldName: field.name } }));
};

// `@commercetools/sync-actions`'s enum diffing (`actionsMapEnums` in its
// source) only wires up ADD_ACTIONS/CHANGE_ACTIONS for a field's enum
// `values` — no REMOVE_ACTIONS — so a removed enum value is silently
// dropped from the diff; no removeEnumValues/removeLocalizedEnumValues
// action is ever generated. Detect removals ourselves instead. Must run
// (and be applied) before any changeEnumValueOrder action, since that
// action's `keys` must match the field's *current* value set at the time
// it's applied — which only holds once the removal has already happened.
const calculateEnumValueRemovals = (
  originalDraft: PickedFieldDefinition,
  nextDraft: PickedFieldDefinition
): Array<TTypeUpdateAction> => {
  const typeName = originalDraft.type.name;
  if (
    !originalDraft.name ||
    (typeName !== 'Enum' && typeName !== 'LocalizedEnum')
  ) {
    return [];
  }

  const originalValues = (originalDraft.type as TEnumType | TLocalizedEnumType)
    .values;
  const nextValues =
    nextDraft.type.name === typeName
      ? (nextDraft.type as TEnumType | TLocalizedEnumType).values
      : [];
  const nextKeys = new Set(nextValues.map((value) => value.key));
  const removedKeys = originalValues
    .map((value) => value.key)
    .filter((key) => !nextKeys.has(key));

  if (removedKeys.length === 0) {
    return [];
  }

  return typeName === 'Enum'
    ? [
        {
          removeEnumValues: {
            fieldName: originalDraft.name,
            keys: removedKeys,
          },
        },
      ]
    : [
        {
          removeLocalizedEnumValues: {
            fieldName: originalDraft.name,
            keys: removedKeys,
          },
        },
      ];
};

// The removal actions run first (see calculateEnumValueRemovals), so every
// other action must be diffed against the field *as it is after the removal*.
// Diffing against the full original instead makes sync-actions pair the
// remaining values by position: removing a non-last value shifts the ones
// after it, and each shifted value is then reported as a brand-new one
// (an addEnumValue/addLocalizedEnumValue for a key that already exists).
const withoutRemovedEnumValues = (
  originalDraft: PickedFieldDefinition,
  nextDraft: PickedFieldDefinition
): PickedFieldDefinition => {
  const typeName = originalDraft.type.name;
  if (
    (typeName !== 'Enum' && typeName !== 'LocalizedEnum') ||
    nextDraft.type.name !== typeName
  ) {
    return originalDraft;
  }
  const nextKeys = new Set(
    (nextDraft.type as TEnumType | TLocalizedEnumType).values.map(
      (value) => value.key
    )
  );
  const type = originalDraft.type as TEnumType | TLocalizedEnumType;
  return {
    ...originalDraft,
    type: {
      ...type,
      values: type.values.filter((value) => nextKeys.has(value.key)),
    },
  } as PickedFieldDefinition;
};

export const calculateFieldDefinitionUpdateActions = (
  originalDraft: PickedFieldDefinition,
  nextDraft: PickedFieldDefinition
) => {
  const wrappedOriginalDraft = convertToActionData(
    {
      fieldDefinitions: [withoutRemovedEnumValues(originalDraft, nextDraft)],
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
  ) as Array<TypeUpdateAction>;
  return [
    ...calculateEnumValueRemovals(originalDraft, nextDraft),
    ...(createGraphQlUpdateActions(actions) as Array<TTypeUpdateAction>),
  ];
};
