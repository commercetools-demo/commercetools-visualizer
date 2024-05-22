import {
  transformLocalizedStringToLocalizedField,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { isApolloError, ApolloError, type ServerError } from '@apollo/client';
import {
  TBaseMoney,
  TChannel,
  TCustomLineItem,
  THighPrecisionMoney,
  TLineItem,
} from './types/generated/ctp';
import {
  TGraphqlUpdateAction,
  TSyncAction,
  TChangeNameActionPayload,
  TSetDescriptionActionPayload,
  TChangeLocalizedEnumValueLabelActionPayload,
  TSetNameActionPayload,
} from './types';
import { PRECISION_TYPES } from './constants';
import { IntlShape } from 'react-intl';

const sortStringArray = (a: string, b: string) => a.localeCompare(b);
export const compareStringArrays = (
  array1: Array<string> | undefined | null,
  array2: Array<string> | undefined | null
): boolean => {
  if (!array1 && !array2) {
    return true;
  } else if (!array1 || !array2) {
    return false;
  } else {
    const sortedArray1 = array1.sort(sortStringArray);
    const sortedArray2 = array2.sort(sortStringArray);
    const areEqual: boolean =
      sortedArray1.length === sortedArray2.length &&
      sortedArray1.every((value, index) => value === sortedArray2[index]);
    return areEqual;
  }
};
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

const getNameFromPayload = (payload: TChangeNameActionPayload) => ({
  name: transformLocalizedStringToLocalizedField(payload.name),
});

const getDescriptionFromPayload = (payload: TSetDescriptionActionPayload) => ({
  description: transformLocalizedStringToLocalizedField(payload.description),
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
const convertAction = (action: TSyncAction): TGraphqlUpdateAction => {
  const { action: actionName, ...actionPayload } = action;
  let actionPL = actionPayload;
  switch (actionName) {
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
    }
  }
  return {
    [actionName]: actionPL,
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

export const convertToActionData = (draft: Partial<TChannel>) => ({
  ...draft,
  name: transformLocalizedFieldToLocalizedString(draft.nameAllLocales || []),
});

export function getFractionedAmount(moneyValue: TBaseMoney) {
  const { fractionDigits = 2 } = moneyValue;

  // the amount should be available on preciseAmount for highPrecision
  const amount =
    moneyValue.type === PRECISION_TYPES.highPrecision
      ? (moneyValue as THighPrecisionMoney).preciseAmount
      : moneyValue.centAmount;

  return amount / 10 ** fractionDigits;
}

export function formatMoney(
  moneyValue: TBaseMoney | undefined | null,
  intl: IntlShape,
  options?: Record<string, unknown>
) {
  if (!moneyValue || !moneyValue.currencyCode) {
    return '';
  }
  return intl.formatNumber(getFractionedAmount(moneyValue), {
    style: 'currency',
    currency: moneyValue.currencyCode,
    minimumFractionDigits: moneyValue.fractionDigits,
    ...options,
  });
}

export function formatPercentage(percentage: number) {
  return `${percentage}%`;
}

export function convertRatioToPercentage(ratio: number) {
  return parseFloat((ratio * 100).toFixed(2));
}

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export const isCustomLineItem = (
  object: TCustomLineItem | TLineItem
): object is TCustomLineItem => {
  return 'money' in object;
};

export const isLineItem = (
  object: TCustomLineItem | TLineItem
): object is TLineItem => {
  return 'price' in object;
};
