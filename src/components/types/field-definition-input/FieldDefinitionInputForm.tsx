import { ReactElement, FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormik, type FormikHelpers, FormikErrors } from 'formik';
import omitEmpty from 'omit-empty-es';
import Card from '@commercetools-uikit/card';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import { customProperties } from '@commercetools-uikit/design-system';
import Grid from '@commercetools-uikit/grid';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import SelectField from '@commercetools-uikit/select-field';
import Spacings from '@commercetools-uikit/spacings';
import TextField from '@commercetools-uikit/text-field';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { FIELD_TYPES, INPUT_HINTS, REFERENCE_TYPES } from './constants';
import messages from './messages';

type Formik = ReturnType<typeof useFormik>;

Object.entries(FIELD_TYPES).map(([key, value]) => {
  return { label: key, value: value };
});

const fieldTypes = Object.entries(FIELD_TYPES).map(([key, value]) => {
  return { label: key, value: value };
});
const inputHints = Object.entries(INPUT_HINTS).map(([key, value]) => {
  return { label: key, value: value };
});
const referenceTypeOptions = REFERENCE_TYPES.map((t) => ({
  label: t,
  value: t,
}));

export type TFormValues = {
  label: Record<string, string>;
  name: string;
  isSet: boolean;
  required: boolean;
  inputHint: string;
  type: { name: string; referenceTypeId: string };
}; //& TFieldDefinition;

type TErrors = {
  key: { missing?: boolean };
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
};
const validate = (formikValues: TFormValues): FormikErrors<TFormValues> => {
  const errors: TErrors = {
    key: {},
  };

  // if (!formikValues.key || TextInput.isEmpty(formikValues.key)) {
  //   errors.key.missing = true;
  // }
  return omitEmpty(errors);
};

const FieldDefinitionInputForm: FC<Props> = ({
  children,
  initialValues,
  onSubmit,
}) => {
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate,
    enableReinitialize: true,
  });
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const intl = useIntl();
  const editMode = false;
  const formElements = (
    <Spacings.Stack scale="m">
      <Grid
        gridTemplateColumns={`repeat(2, ${customProperties.constraint11})`}
        gridGap={customProperties.spacingM}
      >
        <Grid.Item>
          <Card type="flat" theme="dark">
            <TextField
              name="name"
              hint={<FormattedMessage {...messages.nameHint} />}
              value={formik.values.name}
              title={<FormattedMessage {...messages.nameTitle} />}
              isRequired
              touched={formik.touched.name ? true : false}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            {/* {errors.name && touched.name ? (
              <ErrorMessage>{errors.name}</ErrorMessage>
            ) : null} */}
          </Card>
        </Grid.Item>
        <Grid.Item>
          <Card type="flat" theme="dark">
            <LocalizedTextField
              name="label"
              selectedLanguage={dataLocale}
              value={formik.values.label}
              title={<FormattedMessage {...messages.labelTitle} />}
              isRequired
              touched={formik.touched.label ? true : false}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              renderError={(key, error) => error}
            />
          </Card>
        </Grid.Item>
        <Grid.Item>
          <Card type="flat" theme="dark">
            <SelectField
              name="type.name"
              title={<FormattedMessage {...messages.typeTitle} />}
              isRequired
              value={formik.values.type.name}
              options={fieldTypes}
              touched={formik.touched.type?.name}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              isDisabled={editMode}
            />
          </Card>
          {
            // Only display 'reference' drop-down if reference type selected.
            formik.values.type.name === 'Reference' && (
              <Card type="flat" theme="dark">
                <SelectField
                  name="type.referenceTypeId"
                  title={<FormattedMessage {...messages.referenceTitle} />}
                  isRequired
                  value={formik.values.type.referenceTypeId}
                  options={referenceTypeOptions}
                  // touched={touched.type?.referenceTypeId}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  isDisabled={editMode}
                />
              </Card>
            )
          }
          <Card type="flat" theme="dark">
            <CheckboxInput
              name="isSet"
              onChange={formik.handleChange}
              isChecked={formik.values.isSet}
            >
              <FormattedMessage {...messages.setTitle} />
            </CheckboxInput>
          </Card>
          <Card type="flat" theme="dark">
            <CheckboxInput
              name="required"
              onChange={formik.handleChange}
              isChecked={formik.values.required}
            >
              <FormattedMessage {...messages.requiredTitle} />
            </CheckboxInput>
          </Card>
          <Card type="flat" theme="dark">
            <SelectField
              name="inputHint"
              title={<FormattedMessage {...messages.inputHintTitle} />}
              value={formik.values.inputHint}
              options={inputHints}
              touched={formik.touched.inputHint}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              isDisabled={editMode}
            />
          </Card>
        </Grid.Item>
      </Grid>
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

FieldDefinitionInputForm.displayName = 'FieldDefinitionInputForm';

export default FieldDefinitionInputForm;
