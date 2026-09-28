import {
  Maybe,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TTriggerInput,
} from '../../../types/generated/ctp';
import { FC, ReactElement } from 'react';
import { type FormikHelpers, FormikProvider, useFormik } from 'formik';
import { ApolloQueryResult } from '@apollo/client';
import {
  Accordion,
  Flex,
  FormField,
  PageContent,
  Select,
  TextInput,
} from '@commercetools/nimbus';
import { FormattedMessage, useIntl } from 'react-intl';
import omitEmpty from 'omit-empty-es';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import messages from './messages';
import ExtensionsTriggersForm from '../extensions-triggers-form/extensions-triggers-form';
import ExtensionsDestinationsForm from '../extensions-destinations-form/extensions-destinations-form';
import { PERMISSIONS } from '../../../constants';
import { validateKey } from '../../../utils/validate-key';
import KeyInputError from '../../shared/key-input-error/key-input-error';
import keyInputMessages from '../../shared/key-input-error/messages';

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
  key: { missing?: boolean; invalidInput?: boolean };
  destinationName: { missing?: boolean };
  destinationHttpUrl: { missing?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    key: validateKey(formikValues.key),
    destinationName: {},
    destinationHttpUrl: {},
  };

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
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  // Key and destination type are immutable once created (createNewMode), independent of
  // permission; destination config and triggers have no such immutability rule and are only
  // gated by canManage.
  const isImmutableFieldReadOnly = !createNewMode || !canManage;

  const formElements = (
    <FormikProvider value={formik}>
      <PageContent.Root variant={'wide'}>
        <Flex direction="column" gap="400">
          <FormField.Root
            isRequired
            isReadOnly={isImmutableFieldReadOnly}
            isInvalid={Boolean(formik.touched.key && errors.key)}
          >
            <FormField.Label>
              {intl.formatMessage(messages.keyTitle)}
            </FormField.Label>
            <FormField.Input>
              <TextInput
                name="key"
                aria-label={intl.formatMessage(messages.keyTitle)}
                value={formik.values.key || ''}
                isReadOnly={isImmutableFieldReadOnly}
                onChange={(value) => formik.setFieldValue('key', value)}
                onBlur={() => formik.setFieldTouched('key', true)}
                width={'full'}
              />
            </FormField.Input>
            <FormField.Description>
              {intl.formatMessage(keyInputMessages.keyHint)}
            </FormField.Description>
            <FormField.Error>
              <KeyInputError error={errors.key} resourceLabel="extension" />
            </FormField.Error>
          </FormField.Root>
          <Accordion.Root
            allowsMultipleExpanded
            defaultExpandedKeys={
              createNewMode ? ['destination', 'triggers'] : []
            }
          >
            <Accordion.Item value="destination">
              <Accordion.Header>
                <FormattedMessage {...messages.destinationTitle} />
              </Accordion.Header>
              <Accordion.Content>
                <FormField.Root
                  isRequired
                  isReadOnly={isImmutableFieldReadOnly}
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
                      isDisabled={isImmutableFieldReadOnly}
                      value={formik.values.destinationName || ''}
                      onChange={(value) =>
                        formik.setFieldValue(
                          'destinationName',
                          value as DestinationName
                        )
                      }
                      onBlur={() =>
                        formik.setFieldTouched('destinationName', true)
                      }
                      width={'full'}
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
                <ExtensionsDestinationsForm
                  formik={formik}
                  isReadOnly={!canManage}
                />
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="triggers">
              <Accordion.Header>
                <FormattedMessage {...messages.triggersTitle} />
              </Accordion.Header>
              <Accordion.Content>
                <ExtensionsTriggersForm isReadOnly={!canManage} />
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
export default ExtensionsForm;
