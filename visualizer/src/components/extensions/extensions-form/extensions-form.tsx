import {
  Maybe,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TTriggerInput,
} from '../../../types/generated/ctp';
import { FC, ReactElement } from 'react';
import { type FormikHelpers, FormikProvider, useFormik } from 'formik';
import { ApolloQueryResult } from '@apollo/client';
import { Accordion, FormField, Select, TextInput } from '@commercetools/nimbus';
import { FormattedMessage, useIntl } from 'react-intl';
import omitEmpty from 'omit-empty-es';
import messages from './messages';
import ExtensionsTriggersForm from '../extensions-triggers-form/extensions-triggers-form';
import ExtensionsDestinationsForm from '../extensions-destinations-form/extensions-destinations-form';

type Formik = ReturnType<typeof useFormik>;

export type DestinationName = 'HTTP' | 'GoogleCloudFunction' | 'AWSLambda';
export type DestinationHttpAuthenticationName =
  | 'AuthorizationHeader'
  | 'AzureFunctions'
  | '';

export type TFormValues = {
  key?: Maybe<string>;
  destinationName: DestinationName;
  destinationHttpUrl?: string;
  destinationHttpAuthenticationName?: DestinationHttpAuthenticationName;
  destinationHttpAuthenticationAuthorizationHeaderValue?: string;
  destinationHttpAuthenticationAuthorizationKey?: string;
  destinationAwsAccessKey?: string;
  destinationAwsAccessSecret?: string;
  destinationAwsArn?: string;
  timeoutInMs?: number;
  triggers: Array<TTriggerInput>;
};

type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
};

type TErrors = {
  key: { missing?: boolean; invalidInput?: boolean; keyHint?: boolean };
  destinationName: { missing?: boolean };
  destinationHttpUrl: { missing?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    key: {},
    destinationName: {},
    destinationHttpUrl: {},
  };

  if (formikValues.key && formikValues.key.length > 0) {
    const keyValue = formikValues.key.trim();
    const keyLength = keyValue.length;
    if (keyLength < 2 || keyLength > 256 || !/^[a-zA-Z0-9-_]+$/.test(keyValue))
      errors.key.invalidInput = true;
  } else {
    errors.key.missing = true;
  }

  if (
    !formikValues.destinationName ||
    formikValues.destinationName.length === 0
  ) {
    errors.destinationName.missing = true;
  } else {
    if (formikValues.destinationName === 'HTTP') {
      if (
        !formikValues.destinationHttpUrl ||
        formikValues.destinationHttpUrl.length === 0
      ) {
        errors.destinationHttpUrl.missing = true;
      }
    }
  }

  return omitEmpty<TErrors>(errors);
};

const renderKeyInputError = (key?: TErrors['key']): ReactElement | null => {
  if (!key) return null;
  if (key.invalidInput) return <FormattedMessage {...messages.invalidKey} />;
  if (key.missing) return <FormattedMessage {...messages.requiredKey} />;
  return null;
};

type Props = {
  onSubmit: (
    values: TFormValues,
    formikHelpers: FormikHelpers<TFormValues>
  ) => void | Promise<unknown>;
  initialValues: TFormValues;
  dataLocale: string;
  children: (formProps: FormProps) => React.JSX.Element;
  version: number;
  refetch?: (
    variables?: Partial<TQuery_TypeDefinitionArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
  createNewMode?: boolean;
};

const ExtensionsForm: FC<Props> = ({
  initialValues,
  onSubmit,
  children,
  createNewMode = false,
}) => {
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate,
    enableReinitialize: true,
  });
  const intl = useIntl();
  const errors = formik.errors as Partial<TErrors>;

  const formElements = (
    <FormikProvider value={formik}>
      <Accordion.Root
        allowsMultipleExpanded
        defaultExpandedKeys={
          createNewMode ? ['general', 'destination', 'triggers'] : ['general']
        }
      >
        <Accordion.Item value="general">
          <Accordion.Header>
            <FormattedMessage {...messages.generalInformationTitle} />
          </Accordion.Header>
          <Accordion.Content>
            <FormField.Root
              isRequired
              isReadOnly={!createNewMode}
              isInvalid={Boolean(formik.touched.key && errors.key)}
            >
              <FormField.Label>
                {intl.formatMessage(messages.keyTitle)}
              </FormField.Label>
              <FormField.Input>
                <TextInput
                  aria-label={intl.formatMessage(messages.keyTitle)}
                  value={formik.values.key || ''}
                  isReadOnly={!createNewMode}
                  onChange={(value) => formik.setFieldValue('key', value)}
                  onBlur={() => formik.setFieldTouched('key', true)}
                />
              </FormField.Input>
              <FormField.Description>
                {intl.formatMessage(messages.keyHint)}
              </FormField.Description>
              <FormField.Error>
                {renderKeyInputError(errors.key)}
              </FormField.Error>
            </FormField.Root>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="destination">
          <Accordion.Header>
            <FormattedMessage {...messages.destinationTitle} />
          </Accordion.Header>
          <Accordion.Content>
            <FormField.Root
              isRequired
              isReadOnly={!createNewMode}
              isInvalid={Boolean(
                formik.touched.destinationName && errors.destinationName
              )}
            >
              <FormField.Label>
                {intl.formatMessage(messages.destinationLabel)}
              </FormField.Label>
              <FormField.Input>
                <Select.Root
                  aria-label={intl.formatMessage(messages.destinationLabel)}
                  isDisabled={!createNewMode}
                  value={formik.values.destinationName || ''}
                  onChange={(value) =>
                    formik.setFieldValue(
                      'destinationName',
                      value as DestinationName
                    )
                  }
                  onBlur={() => formik.setFieldTouched('destinationName', true)}
                >
                  <Select.Options>
                    <Select.Option id="HTTP">
                      {intl.formatMessage(messages.destinationHTTP)}
                    </Select.Option>
                    <Select.Option id="AWSLambda">
                      {intl.formatMessage(messages.destinationAWSLambda)}
                    </Select.Option>
                  </Select.Options>
                </Select.Root>
              </FormField.Input>
              <FormField.Description>
                {intl.formatMessage(messages.destinationDescription)}
              </FormField.Description>
              <FormField.Error>
                {formik.touched.destinationName &&
                errors.destinationName?.missing
                  ? intl.formatMessage(messages.requiredFieldError)
                  : null}
              </FormField.Error>
            </FormField.Root>
            <ExtensionsDestinationsForm formik={formik} />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="triggers">
          <Accordion.Header>
            <FormattedMessage {...messages.triggersTitle} />
          </Accordion.Header>
          <Accordion.Content>
            <ExtensionsTriggersForm />
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
export default ExtensionsForm;
