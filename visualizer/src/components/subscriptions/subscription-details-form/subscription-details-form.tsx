import { FC, ReactElement } from 'react';
import {
  useFormik,
  type FormikHelpers,
  FormikErrors,
  FormikProvider,
} from 'formik';
import TextInput from '@commercetools-uikit/text-input';
import omitEmpty from 'omit-empty-es';
import SubscriptionGeneralInfoForm from '../subscription-general-info-form/subscription-general-info-form';
import SubscriptionDestinationTypeForm from '../subscription-destination-type-form/subscription-destination-type-form';
import {
  TChangeSubscriptionInput,
  TGoogleCloudPubSubDestination,
  TMessageSubscriptionInput,
  TSqsDestination,
} from '../../../types/generated/ctp';
import SubscriptionDestinationForm from '../subscription-destination-form/subscription-destination-form';
import SubscriptionChangesForm from '../subscription-changes-form/subscription-changes-form';
import SubscriptionMessagesForm from '../subscription-messages-form/subscription-messages-form';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';

type Formik = ReturnType<typeof useFormik>;

export type TFormValues = {
  id: string;
  key: string;
  destinationType: string;
  destination: { GoogleCloudPubSub?: TGoogleCloudPubSubDestination, SQS?: TSqsDestination } | undefined;
  changes?: Array<TChangeSubscriptionInput> | null;
  messages?: Array<TMessageSubscriptionInput> | null;
};

export type TErrors = {
  key: { missing?: boolean };
};

const validate = (formikValues: TFormValues): FormikErrors<TFormValues> => {
  const errors: TErrors = {
    key: {},
  };

  if (!formikValues.key || TextInput.isEmpty(formikValues.key)) {
    errors.key.missing = true;
  }
  return omitEmpty(errors);
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
    validate,
    enableReinitialize: true,
  });
  const formElements = (
    <FormikProvider value={formik}>
      <CollapsiblePanel
        header={<CollapsiblePanel.Header>Key</CollapsiblePanel.Header>}
      >
        <SubscriptionGeneralInfoForm isReadOnly={isReadOnly} />
      </CollapsiblePanel>
      <CollapsiblePanel
        header={
          <CollapsiblePanel.Header>
            Subscription Destination
          </CollapsiblePanel.Header>
        }
        isDefaultClosed={false}
      >
        <SubscriptionDestinationTypeForm isReadOnly={isReadOnly} />
        <SubscriptionDestinationForm
          destinationType={formik.values.destinationType}
          isReadOnly={isReadOnly}
        />
      </CollapsiblePanel>
      <CollapsiblePanel
        header={<CollapsiblePanel.Header>Changes</CollapsiblePanel.Header>}
        isDefaultClosed={true}
      >
        <SubscriptionChangesForm isReadOnly={isReadOnly} />
      </CollapsiblePanel>
      <CollapsiblePanel
        header={<CollapsiblePanel.Header>Messages</CollapsiblePanel.Header>}
        isDefaultClosed={true}
      >
        <SubscriptionMessagesForm isReadOnly={isReadOnly} />
      </CollapsiblePanel>
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
