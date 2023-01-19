import { FC, ReactElement } from 'react';
import { useFormik, type FormikHelpers, FormikErrors } from 'formik';
import TextField from '@commercetools-uikit/text-field';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import { customProperties } from '@commercetools-uikit/design-system';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';
import { FormattedMessage, useIntl } from 'react-intl';
import TextInput from '@commercetools-uikit/text-input';
import omitEmpty from 'omit-empty-es';
import Grid from '@commercetools-uikit/grid';
import SelectField from '@commercetools-uikit/select-field';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { Maybe, TFieldDefinition } from '../../../types/generated/ctp';
import messages from './messages';
import { RESOURCE_TYPES } from './constants';
import FieldTable from './FieldTable';

const resourceTypes = RESOURCE_TYPES.map((t) => ({ label: t, value: t }));
type Formik = ReturnType<typeof useFormik>;

type TErrors = {
  key: { missing?: boolean; keyHint?: boolean };
};

const validate = (formikValues: TFormValues): FormikErrors<TFormValues> => {
  const errors: TErrors = {
    key: {},
  };

  if (!formikValues.key || TextInput.isEmpty(formikValues.key)) {
    errors.key.missing = true;
  }
  if (
    formikValues.key &&
    (formikValues.key.length < 2 || formikValues.key.length > 256)
  ) {
    errors.key.keyHint = true;
  }
  return omitEmpty(errors);
};

export type TFormValues = {
  id: string;
  key?: Maybe<string>;
  name: Record<string, string>;
  description: Record<string, string>;
  resourceTypeIds: Array<string>;
  fieldDefinitions: Array<TFieldDefinition>;
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
  isReadOnly: boolean;
  dataLocale: string;
  children: (formProps: FormProps) => JSX.Element;
  editMode?: boolean;
};

const TypeDefinitionDetailsForm: FC<Props> = ({
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
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const formElements = (
    <Spacings.Stack scale="m">
      <CollapsiblePanel
        header={
          <CollapsiblePanel.Header>
            <FormattedMessage {...messages.generalInformationTitle} />
          </CollapsiblePanel.Header>
        }
      >
        <Grid
          gridTemplateColumns={`repeat(2, ${customProperties.constraint11})`}
          gridGap={customProperties.spacingM}
        >
          <Grid.Item>
            <Card type="flat" insetScale="s">
              <LocalizedTextField
                name="name"
                selectedLanguage={dataLocale}
                value={formik.values.name}
                title={intl.formatMessage(messages.nameTitle)}
                isRequired
                //errors={formik.errors.name}
                touched={formik.touched.name ? true : false}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                renderError={(key, error) => error}
              />
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card type="flat" insetScale="s">
              <LocalizedTextField
                name="description"
                selectedLanguage={dataLocale}
                value={formik.values.description}
                title={intl.formatMessage(messages.descriptionTitle)}
                isRequired
                //errors={formik.errors.description}
                touched={formik.touched.description ? true : false}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                renderError={(key, error) => error}
              />
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card type="flat" insetScale="s">
              <TextField
                name="key"
                value={formik.values.key || ''}
                title={intl.formatMessage(messages.keyTitle)}
                hint={intl.formatMessage(messages.keyHint)}
                isRequired
                errors={TextField.toFieldErrors<TFormValues>(formik.errors).key}
                touched={formik.touched.key ? true : false}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                //renderError={(key, error) => error}
                isDisabled={isReadOnly}
                renderError={(errorKey) => {
                  console.log(errorKey);
                  if (errorKey === 'keyHint') {
                    return intl.formatMessage(messages.keyHint);
                  }
                  return null;
                }}
              />
              {/* {formik.errors.key && formik.touched.key ? (
                <ErrorMessage>{formik.errors.key}</ErrorMessage>
              ) : null} */}
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card type="flat" insetScale="s">
              <SelectField
                name="resourceTypeIds"
                title={intl.formatMessage(messages.resourceTypeIdsTitle)}
                isRequired
                isMulti
                value={formik.values.resourceTypeIds}
                options={resourceTypes}
                // errors={formik.errors.resourceTypeIds}
                touched={formik.touched.resourceTypeIds}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                isDisabled={isReadOnly}
              />
            </Card>
          </Grid.Item>
        </Grid>
      </CollapsiblePanel>
      {!isReadOnly && (
        <CollapsiblePanel
          header={
            <CollapsiblePanel.Header>
              <FormattedMessage {...messages.typeInformationTitle} />
            </CollapsiblePanel.Header>
          }
        >
          <FieldTable
            value={formik.values.fieldDefinitions}
            onBlur={formik.handleBlur}
            //onChange={setFieldValue}
          />
        </CollapsiblePanel>
      )}
    </Spacings.Stack>
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

TypeDefinitionDetailsForm.displayName = 'TypeDefinitionDetailsForm';

export default TypeDefinitionDetailsForm;
