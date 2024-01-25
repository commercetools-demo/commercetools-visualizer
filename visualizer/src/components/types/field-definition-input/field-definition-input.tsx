import { FC, ReactElement } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FormikErrors, type FormikHelpers, useFormik } from 'formik';
import omitEmpty from 'omit-empty-es';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import SelectField from '@commercetools-uikit/select-field';
import Spacings from '@commercetools-uikit/spacings';
import TextField from '@commercetools-uikit/text-field';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { FIELD_TYPES, REFERENCE_TYPES } from './constants';
import messages from './messages';
import {
  PageContentFull,
  PageContentNarrow,
} from '@commercetools-frontend/application-components';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import RadioInput from '@commercetools-uikit/radio-input';
import { TFormValues } from './helpers';
import FieldDefinitionInputForEnum from '../field-definition-input-for-enum/field-definition-input-for-enum';
import { Item } from '../field-definition-input-for-enum/constants';

type Formik = ReturnType<typeof useFormik>;

const fieldTypes = Object.entries(FIELD_TYPES).map(([key, value]) => {
  return { value: key, label: value };
});
const referenceTypeOptions = REFERENCE_TYPES.map((t) => ({
  label: t,
  value: t,
}));

type TErrors = {
  name: { missing?: boolean; invalidInput?: boolean; keyHint?: boolean };
  label: { missing?: boolean };
  typeName: { missing?: boolean };
  referenceTypeId: { missing?: boolean };
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
    name: {},
    label: {},
    typeName: {},
    referenceTypeId: {},
  };

  if (formikValues.name && formikValues.name.length > 0) {
    const keyValue = formikValues.name.trim();
    const keyLength = keyValue.length;
    if (keyLength < 2 || keyLength > 256 || !/^[a-zA-Z0-9-_]+$/.test(keyValue))
      errors.name.invalidInput = true;
  } else {
    errors.name.missing = true;
  }

  if (LocalizedTextInput.isEmpty(formikValues.label)) {
    errors.label.missing = true;
  }
  if (!formikValues.typeName || formikValues.typeName.length === 0) {
    errors.typeName.missing = true;
  }
  if (formikValues.typeName === 'Reference' && !formikValues.referenceTypeId) {
    errors.referenceTypeId.missing = true;
  }
  return omitEmpty(errors);
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
const FieldDefinitionInput: FC<Props> = ({
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

  const handleAddEnumValue = (enumTemplate: Item) => {
    // console.log(enumTemplate);
    const enumDraftItemIndexes = formik.values.enumValues?.length || 0;
    formik.setFieldValue(`enumValues.${enumDraftItemIndexes}`, enumTemplate);
  };

  const handleRemoveEnumValue = (absoluteIndex: number) => {
    // console.log(absoluteIndex);
    if (formik.values.enumValues && formik.values.enumValues[absoluteIndex]) {
      const nextEnumDraftItems = [...formik.values.enumValues].splice(
        absoluteIndex,
        1
      );

      formik.setFieldValue('enumValues', nextEnumDraftItems, false);
    }
  };

  const handleChangeEnumValue = ({
    field,
    nextValue,
    absoluteIndex,
  }: {
    field: string;
    nextValue: string;
    absoluteIndex: number;
  }) => {
    // if this is the first change, create the draft within the changes
    if (!formik.values.enumValues || !formik.values.enumValues[absoluteIndex]) {
      formik.setFieldValue(`enumValues.${absoluteIndex}`, {
        key: '',
        label: undefined,
      });
    }
    // `field` can be `key` or `label` (or `label.de` depending on the attribute being localized or not)
    formik.setFieldValue(
      `enumValues.${absoluteIndex}.${field}`,
      nextValue,
      false
    );
    formik.setFieldTouched(`enumValues.${absoluteIndex}.${field}`, true);
  };

  const formElements = (
    <Spacings.Stack scale="m">
      <PageContentNarrow>
        <Spacings.Stack scale="m">
          <TextField
            name="name"
            hint={intl.formatMessage(messages.nameHint)}
            value={formik.values.name}
            title={intl.formatMessage(messages.nameTitle)}
            isRequired
            touched={!!formik.touched.name}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            isDisabled={!createNewMode}
            errors={TextField.toFieldErrors<TFormValues>(formik.errors).name}
            renderError={renderKeyInputErrors}
          />
          <LocalizedTextField
            name="label"
            selectedLanguage={dataLocale}
            value={formik.values.label}
            title={intl.formatMessage(messages.labelTitle)}
            isRequired
            touched={!!formik.touched.label}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            errors={
              LocalizedTextField.toFieldErrors<TFormValues>(formik.errors).label
            }
          />
          <Spacings.Inline alignItems="flex-end">
            <SelectField
              name="typeName"
              title={intl.formatMessage(messages.typeTitle)}
              isRequired
              value={formik.values.typeName}
              options={fieldTypes}
              touched={formik.touched.typeName}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              isDisabled={!createNewMode}
              errors={
                SelectField.toFieldErrors<TFormValues>(formik.errors).typeName
              }
            />
            {(formik.values.typeName === 'String' ||
              formik.values.typeName === 'Enum') && (
              <CheckboxInput
                name="isLocalized"
                isDisabled={!createNewMode}
                isChecked={formik.values.isLocalized}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              >
                <FormattedMessage {...messages.localizedLabel} />
              </CheckboxInput>
            )}
            {formik.values.typeName === 'Date' && (
              <RadioInput.Group
                direction="inline"
                onChange={formik.handleChange}
                value={formik.values.format}
                name="format"
                isDisabled={!createNewMode}
              >
                <RadioInput.Option value="date">
                  <FormattedMessage {...messages.optionDate} />
                </RadioInput.Option>
                <RadioInput.Option value="time">
                  <FormattedMessage {...messages.optionTime} />
                </RadioInput.Option>
                <RadioInput.Option value="datetime">
                  <span style={{ whiteSpace: 'nowrap' }}>
                    <FormattedMessage {...messages.optionDateTime} />
                  </span>
                </RadioInput.Option>
              </RadioInput.Group>
            )}
          </Spacings.Inline>
          {
            // Only display 'reference' drop-down if reference type selected.
            formik.values.typeName === 'Reference' && (
              <SelectField
                name="referenceTypeId"
                title={intl.formatMessage(messages.referenceTitle)}
                isRequired
                value={formik.values.referenceTypeId}
                options={referenceTypeOptions}
                touched={formik.touched.referenceTypeId}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                isDisabled={!createNewMode}
                errors={
                  SelectField.toFieldErrors<TFormValues>(formik.errors)
                    .referenceTypeId
                }
              />
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
          <CheckboxInput
            name="required"
            onChange={formik.handleChange}
            isChecked={formik.values.required}
            isDisabled={!createNewMode}
          >
            <FormattedMessage {...messages.requiredTitle} />
          </CheckboxInput>
          {
            // Only display 'inputHint' drop-down if string or LocalizedString type selected.
            formik.values.typeName === 'String' && (
              <CheckboxInput
                name="isMultiLine"
                onChange={formik.handleChange}
                isDisabled={!createNewMode}
                isChecked={formik.values.isMultiLine}
              >
                <FormattedMessage {...messages.inputHintTitle} />
              </CheckboxInput>
            )
          }
        </Spacings.Stack>
      </PageContentNarrow>
      {formik.values.typeName === 'Enum' && (
        <PageContentFull>
          <FieldDefinitionInputForEnum
            formik={formik}
            onAddEnumValue={handleAddEnumValue}
            onChangeEnumValue={handleChangeEnumValue}
            onRemoveEnumValue={handleRemoveEnumValue}
            isDisabled={!createNewMode}
          />
        </PageContentFull>
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

FieldDefinitionInput.displayName = 'FieldDefinitionInputForm';

export default FieldDefinitionInput;
