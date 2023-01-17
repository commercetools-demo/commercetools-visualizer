import { Maybe } from './types/generated/ctp';

export type TFormValues = {
  id: string;
  key?: Maybe<string>;
  GoogleCloudPubSub?: { topic: 'string'; projectId: string };
};
