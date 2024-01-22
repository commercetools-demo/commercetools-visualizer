import { TChannelRole, TDestinationInput } from './types/generated/ctp';

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
  name: Record<string, string>;
};
