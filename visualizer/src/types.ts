import { TChannelRole, TDestinationInput } from './types/generated/ctp';
import { LocalizedString } from './components/types/field-definition-input-for-enum/constants';

export type TFormValues = {
  id: string;
  key: string;
  destinationType: string;
  destination: TDestinationInput;
  name?: Record<string, string>;
  roles?: TChannelRole[];
};

export type TSyncAction = { action: string; [x: string]: unknown };

export type TGraphqlUpdateAction = Record<string, Record<string, unknown>>;

export type TChangeNameActionPayload = {
  name: LocalizedString;
};

export type TSetDescriptionActionPayload = {
  description: LocalizedString;
};

export type TChangeLocalizedEnumValueLabelActionPayload = {
  fieldName: string;
  value: { key: string; label: LocalizedString };
};
