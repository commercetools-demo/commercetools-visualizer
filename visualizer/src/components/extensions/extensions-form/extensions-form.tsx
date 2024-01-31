import {
  Maybe,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TTriggerInput,
} from '../../../types/generated/ctp';
import { FC, ReactElement } from 'react';
import { type FormikHelpers, FormikProvider, useFormik } from 'formik';
import { ApolloQueryResult } from '@apollo/client';
import { PageContentWide } from '@commercetools-frontend/application-components';
import Spacings from '@commercetools-uikit/spacings';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import TextField from '@commercetools-uikit/text-field';
import omitEmpty from 'omit-empty-es';
import ExtensionsTriggersForm from '../extensions-triggers-form/extensions-triggers-form';
import SelectField from '@commercetools-uikit/select-field';
import ExtensionsDestinationsForm from '../extensions-destinations-form/extensions-destinations-form';
import Constraints from '@commercetools-uikit/constraints';
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
  destinationHttpAuthenticationName: DestinationHttpAuthenticationName;
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
  destinationHttpAuthenticationName: { missing?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    key: {},
    destinationName: {},
    destinationHttpUrl: {},
    destinationHttpAuthenticationName: {},
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
      if (formikValues.destinationHttpAuthenticationName === undefined) {
        errors.destinationHttpAuthenticationName.missing = true;
      }
    }
  }

  return omitEmpty<TErrors>(errors);
};

const renderKeyInputErrors = (key: string) => {
  switch (key) {
    case 'invalidInput':
      return <FormattedMessage {...messages.invalidKey} />;
    case 'duplicate':
      return <FormattedMessage {...messages.duplicateKey} />;
    case 'missing':
      return <FormattedMessage {...messages.requiredKey} />;
    default:
      return null;
  }
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
  createNewMode,
}) => {
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate,
    enableReinitialize: true,
  });
  const intl = useIntl();
  console.log(formik.values);

  const formElements = (
    <PageContentWide columns="2/1" gapSize="20">
      <Spacings.Stack scale="m">
        <FormikProvider value={formik}>
          <CollapsiblePanel
            header={
              <CollapsiblePanel.Header>
                <FormattedMessage {...messages.generalInformationTitle} />
              </CollapsiblePanel.Header>
            }
          >
            <TextField
              name="key"
              value={formik.values.key || ''}
              title={intl.formatMessage(messages.keyTitle)}
              hint={intl.formatMessage(messages.keyHint)}
              isRequired
              errors={TextField.toFieldErrors<TFormValues>(formik.errors).key}
              touched={!!formik.touched.key}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              renderError={renderKeyInputErrors}
            />
          </CollapsiblePanel>
          <CollapsiblePanel
            header={
              <CollapsiblePanel.Header>Destination</CollapsiblePanel.Header>
            }
            isDefaultClosed={!createNewMode}
          >
            <Constraints.Horizontal max={'scale'}>
              <Spacings.Stack scale="m">
                <SelectField
                  key={'destinationName'}
                  title={<FormattedMessage {...messages.destinationLabel} />}
                  description={
                    <FormattedMessage {...messages.destinationDescription} />
                  }
                  errors={
                    SelectField.toFieldErrors<TFormValues>(formik.errors)
                      .destinationName
                  }
                  name={'destinationName'}
                  isRequired={true}
                  isDisabled={!createNewMode}
                  options={[
                    {
                      value: 'HTTP',
                      label: <FormattedMessage {...messages.destinationHTTP} />,
                    },
                    {
                      value: 'AWSLambda',
                      label: (
                        <FormattedMessage {...messages.destinationAWSLambda} />
                      ),
                    },
                  ]}
                  value={formik.values.destinationName || ''}
                  touched={!!formik.touched.destinationName}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                <ExtensionsDestinationsForm formik={formik} />
              </Spacings.Stack>
            </Constraints.Horizontal>
          </CollapsiblePanel>
          <CollapsiblePanel
            header={<CollapsiblePanel.Header>Triggers</CollapsiblePanel.Header>}
            isDefaultClosed={!createNewMode}
          >
            <ExtensionsTriggersForm />
          </CollapsiblePanel>
        </FormikProvider>
      </Spacings.Stack>
    </PageContentWide>
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
