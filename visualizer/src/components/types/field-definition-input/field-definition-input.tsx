import { FC, ReactElement, ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FormikErrors, type FormikHelpers, useFormik } from 'formik';
import omitEmpty from 'omit-empty-es';
import {
  Box,
  Checkbox,
  FormField,
  LocalizedField,
  RadioInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@commercetools/nimbus';
import { REFERENCE_TYPES } from './constants';
import messages from './messages';
import { TFormValues } from './helpers';
import FieldDefinitionInputForEnum from '../field-definition-input-for-enum/field-definition-input-for-enum';
import { Item } from '../field-definition-input-for-enum/constants';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';

type Formik = ReturnType<typeof useFormik>;

const fieldTypeOptions: Array<{
  value: string;
  message: { id: string; defaultMessage: string };
}> = [
  { value: 'Boolean', message: messages.typeBoolean },
  { value: 'String', message: messages.typeText },
  { value: 'Number', message: messages.typeNumber },
  { value: 'Money', message: messages.typeMoney },
  { value: 'Date', message: messages.typeDate },
  { value: 'Reference', message: messages.typeReference },
  { value: 'Enum', message: messages.typeEnum },
];

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

  if (LocalizedField.isEmpty(formikValues.label)) {
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

const renderNameInputError = (name?: TErrors['name']): ReactNode => {
  if (!name) return null;
  if (name.invalidInput) return <FormattedMessage {...messages.invalidKey} />;
  if (name.missing) return <FormattedMessage {...messages.requiredKey} />;
  return null;
};

const FieldDefinitionInput: FC<Props> = ({
  children,
  initialValues,
  onSubmit,
  dataLocale,
  createNewMode = false,
}) => {
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate,
    enableReinitialize: true,
  });
  const intl = useIntl();

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const errors = formik.errors as Partial<TErrors>;
  const isImmutable = !createNewMode;

  const handleAddEnumValue = (enumTemplate: Item) => {
    const enumDraftItemIndexes = formik.values.enumValues?.length || 0;
    formik.setFieldValue(`enumValues.${enumDraftItemIndexes}`, enumTemplate);
  };

  const handleRemoveEnumValue = (absoluteIndex: number) => {
    if (formik.values.enumValues && formik.values.enumValues[absoluteIndex]) {
      const newArray = [...formik.values.enumValues];
      newArray.splice(absoluteIndex, 1);
      formik.setFieldValue('enumValues', newArray, false);
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
    if (!formik.values.enumValues || !formik.values.enumValues[absoluteIndex]) {
      formik.setFieldValue(`enumValues.${absoluteIndex}`, {
        key: '',
        label: undefined,
      });
    }
    formik.setFieldValue(
      `enumValues.${absoluteIndex}.${field}`,
      nextValue,
      false
    );
    formik.setFieldTouched(`enumValues.${absoluteIndex}.${field}`, true);
  };

  const formElements = (
    <Stack direction="column" gap="600">
      <Stack direction="column" gap="400" maxWidth="600px">
        <FormField.Root
          isRequired
          isReadOnly={!canManage}
          isDisabled={isImmutable}
          isInvalid={Boolean(formik.touched.name && errors.name)}
        >
          <FormField.Label>
            {intl.formatMessage(messages.nameTitle)}
          </FormField.Label>
          <FormField.Input>
            <TextInput
              aria-label={intl.formatMessage(messages.nameTitle)}
              value={formik.values.name}
              isDisabled={isImmutable}
              onChange={(value) => formik.setFieldValue('name', value)}
              onBlur={() => formik.setFieldTouched('name', true)}
            />
          </FormField.Input>
          <FormField.Description>
            {intl.formatMessage(messages.nameHint)}
          </FormField.Description>
          <FormField.Error>{renderNameInputError(errors.name)}</FormField.Error>
        </FormField.Root>

        <LocalizedField
          id="field-definition-label"
          name="label"
          type="text"
          label={intl.formatMessage(messages.labelTitle)}
          isRequired
          isReadOnly={!canManage}
          defaultLocaleOrCurrency={dataLocale}
          valuesByLocaleOrCurrency={formik.values.label}
          onChange={(event) =>
            formik.setFieldValue(
              `label.${event.target.locale}`,
              event.target.value
            )
          }
          onBlur={() => formik.setFieldTouched('label', true)}
          touched={!!formik.touched.label}
          error={
            formik.touched.label && errors.label?.missing
              ? intl.formatMessage(messages.requiredFieldError)
              : undefined
          }
        />

        <FormField.Root isRequired isDisabled={isImmutable}>
          <FormField.Label>
            {intl.formatMessage(messages.typeTitle)}
          </FormField.Label>
          <FormField.Input>
            <Select.Root
              aria-label={intl.formatMessage(messages.typeTitle)}
              isDisabled={isImmutable}
              value={formik.values.typeName || ''}
              onChange={(value) => formik.setFieldValue('typeName', value)}
            >
              <Select.Options>
                {fieldTypeOptions.map((option) => (
                  <Select.Option key={option.value} id={option.value}>
                    {intl.formatMessage(option.message)}
                  </Select.Option>
                ))}
              </Select.Options>
            </Select.Root>
          </FormField.Input>
        </FormField.Root>

        {(formik.values.typeName === 'String' ||
          formik.values.typeName === 'Enum') && (
          <Checkbox
            isSelected={formik.values.isLocalized}
            isDisabled={isImmutable}
            onChange={(value) => formik.setFieldValue('isLocalized', value)}
          >
            {intl.formatMessage(messages.localizedLabel)}
          </Checkbox>
        )}

        {formik.values.typeName === 'Date' && (
          <FormField.Root isDisabled={isImmutable}>
            <FormField.Label>
              {intl.formatMessage(messages.typeDate)}
            </FormField.Label>
            <FormField.Input>
              <RadioInput.Root
                aria-label={intl.formatMessage(messages.typeDate)}
                orientation="horizontal"
                isDisabled={isImmutable}
                value={formik.values.format}
                onChange={(value) => formik.setFieldValue('format', value)}
              >
                <RadioInput.Option value="date">
                  {intl.formatMessage(messages.optionDate)}
                </RadioInput.Option>
                <RadioInput.Option value="time">
                  {intl.formatMessage(messages.optionTime)}
                </RadioInput.Option>
                <RadioInput.Option value="datetime">
                  {intl.formatMessage(messages.optionDateTime)}
                </RadioInput.Option>
              </RadioInput.Root>
            </FormField.Input>
          </FormField.Root>
        )}

        {formik.values.typeName === 'Reference' && (
          <FormField.Root
            isRequired
            isDisabled={isImmutable}
            isInvalid={Boolean(
              formik.touched.referenceTypeId && errors.referenceTypeId
            )}
          >
            <FormField.Label>
              {intl.formatMessage(messages.referenceTitle)}
            </FormField.Label>
            <FormField.Input>
              <Select.Root
                aria-label={intl.formatMessage(messages.referenceTitle)}
                isDisabled={isImmutable}
                value={formik.values.referenceTypeId || ''}
                onChange={(value) =>
                  formik.setFieldValue('referenceTypeId', value)
                }
              >
                <Select.Options>
                  {REFERENCE_TYPES.map((referenceType) => (
                    <Select.Option key={referenceType} id={referenceType}>
                      {referenceType}
                    </Select.Option>
                  ))}
                </Select.Options>
              </Select.Root>
            </FormField.Input>
            <FormField.Error>
              {formik.touched.referenceTypeId && errors.referenceTypeId?.missing
                ? intl.formatMessage(messages.requiredFieldError)
                : null}
            </FormField.Error>
          </FormField.Root>
        )}

        <Checkbox
          isSelected={formik.values.required}
          isDisabled={isImmutable}
          onChange={(value) => formik.setFieldValue('required', value)}
        >
          {intl.formatMessage(messages.requiredTitle)}
        </Checkbox>

        {formik.values.typeName === 'String' && (
          <Checkbox
            isSelected={formik.values.isMultiLine}
            isDisabled={isImmutable}
            onChange={(value) => formik.setFieldValue('isMultiLine', value)}
          >
            {intl.formatMessage(messages.inputHintTitle)}
          </Checkbox>
        )}

        {formik.values.typeName && (
          <Stack direction="column" gap="100">
            <Checkbox
              isSelected={formik.values.isSet}
              isDisabled={isImmutable || formik.values.required}
              onChange={(value) => formik.setFieldValue('isSet', value)}
            >
              {intl.formatMessage(messages.setTitle)}
            </Checkbox>
            {formik.values.required && (
              <Text fontSize="350" color="neutral.11">
                {intl.formatMessage(messages.setCannotBeRequiredTooltip)}
              </Text>
            )}
          </Stack>
        )}
      </Stack>

      {formik.values.typeName === 'Enum' && (
        <Box>
          <FieldDefinitionInputForEnum
            formik={formik}
            isDisabled={!canManage}
            onAddEnumValue={handleAddEnumValue}
            onChangeEnumValue={handleChangeEnumValue}
            onRemoveEnumValue={handleRemoveEnumValue}
          />
        </Box>
      )}
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

FieldDefinitionInput.displayName = 'FieldDefinitionInputForm';

export default FieldDefinitionInput;
