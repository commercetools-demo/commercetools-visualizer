import { FC, JSX, ReactElement } from 'react';
import { useFormik, type FormikHelpers, FormikProvider } from 'formik';
import SubscriptionGeneralInfoForm from '../subscription-general-info-form/subscription-general-info-form';
import SubscriptionDestinationTypeForm from '../subscription-destination-type-form/subscription-destination-type-form';
import {
  TChangeSubscriptionInput,
  TGoogleCloudPubSubDestination,
  TMessageSubscriptionInput,
  TSqsDestination,
  TConfluentCloudDestination,
} from '../../../types/generated/ctp';
import SubscriptionDestinationForm from '../subscription-destination-form/subscription-destination-form';
import SubscriptionChangesForm from '../subscription-changes-form/subscription-changes-form';
import SubscriptionMessagesForm from '../subscription-messages-form/subscription-messages-form';
import { Accordion } from '@commercetools/nimbus';

type Formik = ReturnType<typeof useFormik>;

export type TFormValues = {
  id: string;
  key: string;
  destinationType: // | 'AzureServiceBus'
  | 'ConfluentCloud'
    // | 'EventBridge'
    // | 'EventGrid'
    | 'GoogleCloudPubSub'
    // | 'SNS'
    | 'SQS'
    | string;
  destination:
    | {
        GoogleCloudPubSub?: TGoogleCloudPubSubDestination;
        SQS?: TSqsDestination;
        ConfluentCloud?: TConfluentCloudDestination;
      }
    | undefined;
  changes?: Array<TChangeSubscriptionInput> | null;
  messages?: Array<TMessageSubscriptionInput> | null;
};

type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
};

type Props = {
  onSubmit: (
    values: TFormValues,
    formikHelpers: FormikHelpers<TFormValues>
  ) => void | Promise<unknown>;
  initialValues: TFormValues;
  isReadOnly?: boolean;
  dataLocale: string;
  children: (formProps: FormProps) => JSX.Element;
};

const SubscriptionDetailsForm: FC<Props> = ({
  children,
  initialValues,
  onSubmit,
  isReadOnly,
}) => {
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    enableReinitialize: true,
  });
  const formElements = (
    <FormikProvider value={formik}>
      <Accordion.Root
        allowsMultipleExpanded
        defaultExpandedKeys={['key', 'destination']}
      >
        <Accordion.Item value="key">
          <Accordion.Header>Key</Accordion.Header>
          <Accordion.Content>
            <SubscriptionGeneralInfoForm isReadOnly={isReadOnly} />
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="destination">
          <Accordion.Header>Subscription Destination</Accordion.Header>
          <Accordion.Content>
            <SubscriptionDestinationTypeForm isReadOnly={isReadOnly} />
            <SubscriptionDestinationForm
              destinationType={formik.values.destinationType}
              isReadOnly={isReadOnly}
            />
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="changes">
          <Accordion.Header>Changes</Accordion.Header>
          <Accordion.Content>
            <SubscriptionChangesForm isReadOnly={isReadOnly} />
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="messages">
          <Accordion.Header>Messages</Accordion.Header>
          <Accordion.Content>
            <SubscriptionMessagesForm isReadOnly={isReadOnly} />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </FormikProvider>
  );

  return children({
    formElements,
    values: formik.values,
    isDirty: formik.dirty,
    isSubmitting: formik.isSubmitting,
    submitForm: formik.handleSubmit,
    handleReset: formik.handleReset,
  });
};

SubscriptionDetailsForm.displayName = 'SubscriptionDetailsForm';

export default SubscriptionDetailsForm;
