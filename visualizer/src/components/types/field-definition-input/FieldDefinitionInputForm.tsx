import { ReactElement, FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormik, type FormikHelpers, FormikErrors } from 'formik';
import omitEmpty from 'omit-empty-es';
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
  required?: boolean;
  inputHint: string;
  type: { name: string; referenceTypeId?: string };
};

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
  dataLocale: string;
  createNewMode?: boolean;
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
  createNewMode = false,
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
  const formElements = (
    <Spacings.Stack scale="m">
      <Grid
        gridTemplateColumns={`repeat(1, ${customProperties.constraint11})`}
        gridGap={customProperties.spacingM}
      >
        <Grid.Item>
          <TextField
            name="name"
            hint={intl.formatMessage(messages.nameHint)}
            value={formik.values.name}
            title={intl.formatMessage(messages.nameTitle)}
            isRequired
            touched={formik.touched.name ? true : false}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            isDisabled={!createNewMode}
          />
          {/* {errors.name && touched.name ? (
              <ErrorMessage>{errors.name}</ErrorMessage>
            ) : null} */}
        </Grid.Item>
        <Grid.Item>
          <LocalizedTextField
            name="label"
            selectedLanguage={dataLocale}
            value={formik.values.label}
            title={intl.formatMessage(messages.labelTitle)}
            isRequired
            touched={formik.touched.label ? true : false}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
        </Grid.Item>
        <Grid.Item>
          <SelectField
            name="type.name"
            title={intl.formatMessage(messages.typeTitle)}
            isRequired
            value={formik.values.type?.name}
            options={fieldTypes}
            touched={formik.touched.type?.name}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            isDisabled={!createNewMode}
          />
        </Grid.Item>
        {
          // Only display 'reference' drop-down if reference type selected.
          formik.values.type.name === 'Reference' && (
            <Grid.Item>
              <SelectField
                name="type.referenceTypeId"
                title={intl.formatMessage(messages.referenceTitle)}
                isRequired
                value={formik.values.type.referenceTypeId}
                options={referenceTypeOptions}
                // touched={touched.type?.referenceTypeId}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                isDisabled={!createNewMode}
              />
            </Grid.Item>
          )
        }

        {/* <Card type="flat" theme="dark">
            <CheckboxInput
              name="isSet"
              onChange={formik.handleChange}
              isChecked={formik.values.isSet}
            >
              intl.formatMessage(messages.setTitle)
            </CheckboxInput>
          </Card> */}
        <Grid.Item>
          <CheckboxInput
            name="required"
            onChange={formik.handleChange}
            isChecked={formik.values.required}
            isDisabled={!createNewMode}
          >
            <FormattedMessage {...messages.requiredTitle} />
          </CheckboxInput>
        </Grid.Item>
        <Grid.Item>
          <SelectField
            name="inputHint"
            title={intl.formatMessage(messages.inputHintTitle)}
            value={formik.values.inputHint}
            options={inputHints}
            touched={formik.touched.inputHint}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            isDisabled={!createNewMode}
          />
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
