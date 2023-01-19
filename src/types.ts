import { Maybe } from './types/generated/ctp';

export type TFormValues = {
  id: string;
  key?: Maybe<string>;
  GoogleCloudPubSub?: { topic: 'string'; projectId: string };
};

export type TSyncAction = { action: string; [x: string]: unknown };

export type TGraphqlUpdateAction = Record<string, Record<string, unknown>>;

export type TChangeNameActionPayload = {
  name: Record<string, string>;
};
