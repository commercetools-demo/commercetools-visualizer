import { FC, JSX, ReactElement } from 'react';
import { useFormik, type FormikHelpers, FormikProvider } from 'formik';
import { FormattedMessage } from 'react-intl';
import omitEmpty from 'omit-empty-es';
import messages from './messages';
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
import {
  Accordion,
  Flex,
  FormField,
  PageContent,
  TextInput,
} from '@commercetools/nimbus';
import { validateKey } from '../../../utils/validate-key';
import KeyInputError, {
  TKeyInputError,
} from '../../shared/key-input-error/key-input-error';

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

type TErrors = {
  // `duplicate` isn't set by client-side validation — it comes from
  // subscription-details-page.tsx's DuplicateField errorCodeMapping via
  // graphQLErrorHandler's setErrors.
  key: { missing?: boolean; invalidInput?: boolean; duplicate?: boolean };
};

const validate = (formikValues: TFormValues): TErrors => {
  return omitEmpty<TErrors>({ key: validateKey(formikValues.key) });
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
    validate: validate,
    enableReinitialize: true,
  });
  const formElements = (
    <FormikProvider value={formik}>
      <PageContent.Root variant={'wide'}>
        <Flex direction="column" gap="400">
          <FormField.Root
            isRequired
            isReadOnly={isReadOnly}
            isInvalid={Boolean(formik.touched.key && formik.errors.key)}
          >
            <FormField.Label>
              <FormattedMessage {...messages.subscriptionKeyLabel} />
            </FormField.Label>
            <FormField.Input>
              <TextInput
                name="key"
                value={formik.values.key || ''}
                isReadOnly={isReadOnly}
                onChange={(value) => formik.setFieldValue('key', value)}
                onBlur={() => formik.setFieldTouched('key', true)}
                width={'full'}
              />
            </FormField.Input>
            <FormField.Error>
              <KeyInputError
                error={formik.errors.key as TKeyInputError}
                resourceLabel="subscription"
              />
            </FormField.Error>
          </FormField.Root>
          <Accordion.Root
            allowsMultipleExpanded
            defaultExpandedKeys={['destination']}
          >
            <Accordion.Item value="destination">
              <Accordion.Header>
                <FormattedMessage {...messages.destinationSectionTitle} />
              </Accordion.Header>
              <Accordion.Content>
                <SubscriptionDestinationTypeForm isReadOnly={isReadOnly} />
                <SubscriptionDestinationForm
                  destinationType={formik.values.destinationType}
                  isReadOnly={isReadOnly}
                />
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="changes">
              <Accordion.Header>
                <FormattedMessage {...messages.changesSectionTitle} />
              </Accordion.Header>
              <Accordion.Content>
                <SubscriptionChangesForm isReadOnly={isReadOnly} />
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="messages">
              <Accordion.Header>
                <FormattedMessage {...messages.messagesSectionTitle} />
              </Accordion.Header>
              <Accordion.Content>
                <SubscriptionMessagesForm isReadOnly={isReadOnly} />
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </Flex>
      </PageContent.Root>
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
