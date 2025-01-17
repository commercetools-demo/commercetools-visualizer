import { TFormValues } from './custom-object-form';
import {
  TCustomObject,
  TCustomObjectDraft,
} from '../../../types/generated/ctp';

export const customObjectToFormValues = (
  customObject?: TCustomObject
): TFormValues => {
  return {
    key: customObject?.key || '',
    container: customObject?.container || '',
    value: JSON.stringify(customObject?.value || {}),
  };
};
export const formValuesToTCustomObject = (
  formValues: TFormValues
): TCustomObjectDraft => {
  return {
    key: formValues.key,
    container: formValues.container,
    value: formValues.value,
  };
};
