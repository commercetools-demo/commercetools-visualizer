import { FC, ReactElement } from 'react';
import { type FormikHelpers, useFormik } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import omitEmpty from 'omit-empty-es';
import {
  Box,
  FormField,
  Grid,
  Heading,
  Stack,
  Text,
  TextInput,
} from '@commercetools/nimbus';
import { ApolloQueryResult } from '@apollo/client';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import {
  TQuery,
  TQuery_TypeDefinitionArgs,
} from '../../../types/generated/ctp';
import ValueEditor from './value-editor';
import messages from './messages';

type Formik = ReturnType<typeof useFormik>;

export type TFormValues = {
  key: string;
  container: string;
  value: string;
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
  container: { missing?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    key: {},
    container: {},
  };

  if (formikValues.key && formikValues.key.length > 0) {
    const keyValue = formikValues.key.trim();
    const keyLength = keyValue.length;
    if (keyLength < 2 || keyLength > 256 || !/^[a-zA-Z0-9-_]+$/.test(keyValue))
      errors.key.invalidInput = true;
  } else {
    errors.key.missing = true;
  }

  if (!formikValues.container || formikValues.container.length === 0) {
    errors.container.missing = true;
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

const CustomObjectForm: FC<Props> = ({
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
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const intl = useIntl();
  const errors = formik.errors as Partial<TErrors>;

  const formElements = (
    <Stack direction="column" gap="800">
      <Stack direction="column" gap="400">
        <Heading as="h2" size="md">
          <FormattedMessage {...messages.generalInformationTitle} />
        </Heading>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="400">
          <FormField.Root
            isRequired
            isReadOnly={!createNewMode || !canManage}
            isInvalid={Boolean(formik.touched.key && errors.key)}
          >
            <FormField.Label>
              {intl.formatMessage(messages.keyTitle)}
            </FormField.Label>
            <FormField.Input>
              <TextInput
                name="key"
                value={formik.values.key}
                isReadOnly={!createNewMode || !canManage}
                onChange={(value) => formik.setFieldValue('key', value)}
                onBlur={() => formik.setFieldTouched('key', true)}
              />
            </FormField.Input>
            <FormField.Description>
              {intl.formatMessage(messages.keyHint)}
            </FormField.Description>
            <FormField.Error>
              {formik.touched.key && errors.key?.missing
                ? intl.formatMessage(messages.requiredFieldError)
                : null}
            </FormField.Error>
          </FormField.Root>
          <FormField.Root
            isRequired
            isReadOnly={!createNewMode || !canManage}
            isInvalid={Boolean(formik.touched.container && errors.container)}
          >
            <FormField.Label>
              {intl.formatMessage(messages.containerTitle)}
            </FormField.Label>
            <FormField.Input>
              <TextInput
                name="container"
                value={formik.values.container}
                isReadOnly={!createNewMode || !canManage}
                onChange={(value) => formik.setFieldValue('container', value)}
                onBlur={() => formik.setFieldTouched('container', true)}
              />
            </FormField.Input>
            <FormField.Error>
              {formik.touched.container && errors.container?.missing
                ? intl.formatMessage(messages.requiredFieldError)
                : null}
            </FormField.Error>
          </FormField.Root>
        </Grid>
      </Stack>

      <Stack direction="column" gap="400">
        <Text fontWeight="500">
          {intl.formatMessage(messages.containerValue)}
        </Text>
        <Box>
          <ValueEditor
            content={{
              text: formik.values.value,
            }}
            readOnly={!canManage}
            onChange={(content) => {
              if ('json' in content) {
                formik.setFieldValue('value', JSON.stringify(content.json));
              } else {
                formik.setFieldValue('value', content.text);
              }
            }}
          />
        </Box>
      </Stack>
    </Stack>
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

CustomObjectForm.displayName = 'CustomObjectForm';

export default CustomObjectForm;
