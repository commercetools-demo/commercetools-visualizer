import { useFormik } from 'formik';
import {
  TChangeSubscriptionInput,
  TGoogleCloudPubSubDestinationInput,
  TSqsDestinationInput,
  TMessageSubscriptionInput,
} from '../../../types/generated/ctp';

export type Step1 = { key: string | undefined | null };
export type Step2 = { destinationType: string | undefined | null };
export type Step3 = {
  destination: {
    GoogleCloudPubSub?: TGoogleCloudPubSubDestinationInput;
    Sqs?: TSqsDestinationInput;
  };
};
export type Step4 = {
  changes?: Array<TChangeSubscriptionInput> | null;
};
export type Step5 = {
  messages?: Array<TMessageSubscriptionInput> | null;
};

export type SubscriptionStepsDraft = {
  1: Step1;
  2: Step2;
  3: Step3;
  4: Step4;
  5: Step5;
};
export type ContextData = {
  subscriptionStepsDraft: SubscriptionStepsDraft;
};
export type SubscriptionStepProps = {
  currentStep: number;
  goToNextStep: () => void;
  totalSteps: number;
  linkToWelcome: string;
  formik: ReturnType<typeof useFormik<ContextData>>;
};
