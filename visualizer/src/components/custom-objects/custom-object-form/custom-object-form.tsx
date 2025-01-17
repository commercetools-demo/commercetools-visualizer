import {
  TQuery,
  TQuery_TypeDefinitionArgs,
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
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import ValueEditor from './value-editor';
import FieldLabel from '@commercetools-uikit/field-label';
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

const CustomObjectForm: FC<Props> = ({ initialValues, onSubmit, children }) => {
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
            <Spacings.Stack scale={'l'}>
              <TextField
                name="key"
                value={formik.values.key}
                title={intl.formatMessage(messages.keyTitle)}
                hint={intl.formatMessage(messages.keyHint)}
                isRequired
                errors={TextField.toFieldErrors<TFormValues>(formik.errors).key}
                touched={!!formik.touched.key}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                isReadOnly={!canManage}
              />
              <TextField
                name="container"
                value={formik.values.container}
                title={intl.formatMessage(messages.containerTitle)}
                isRequired
                errors={
                  TextField.toFieldErrors<TFormValues>(formik.errors).container
                }
                touched={!!formik.touched.container}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                isReadOnly={!canManage}
              />
            </Spacings.Stack>
          </CollapsiblePanel>
          {/*<TextField*/}
          {/*  name="value"*/}
          {/*  value={formik.values.value}*/}
          {/*  title={intl.formatMessage(messages.containerValue)}*/}
          {/*  errors={TextField.toFieldErrors<TFormValues>(formik.errors).value}*/}
          {/*  touched={!!formik.touched.value}*/}
          {/*  onBlur={formik.handleBlur}*/}
          {/*  onChange={formik.handleChange}*/}
          {/*  isReadOnly={!canManage}*/}
          {/*/>*/}
          <FieldLabel title={intl.formatMessage(messages.containerValue)} />
          <ValueEditor
            content={{
              json: JSON.parse(formik.values.value),
              text: undefined,
            }}
            onChange={(content) => {
              if ('json' in content) {
                formik.setFieldValue('value', JSON.stringify(content.json));
              }
            }}
          />
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
export default CustomObjectForm;
