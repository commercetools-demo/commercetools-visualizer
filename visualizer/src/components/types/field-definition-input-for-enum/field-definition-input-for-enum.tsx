import { FC } from 'react';
import { useIntl } from 'react-intl';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Text,
  TextInput,
} from '@commercetools/nimbus';
import { Add, Delete } from '@commercetools/nimbus-icons';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import messages from './messages';
import { Item, LocalizedString } from './constants';
import { TFormValues } from '../field-definition-input/helpers';

type Formik = ReturnType<typeof useFormik>;

const getLocalizedEnumLabel = (
  docLabel: LocalizedString,
  formColumnKey: string
) => {
  if (!docLabel) {
    return '';
  }
  return docLabel[formColumnKey.split('_')[1]] || '';
};
const formToDocLocalizedEnumLabel = (formColumnKey: string) =>
  formColumnKey.replace('_', '.');

const getLangsFromEnums = (enums: Array<Item>): Array<string> => {
  const map = enums
    .map((item) => (item.label ? Object.keys(item.label) : []))
    .flat();
  return Array.from(new Set(map));
};

export function sortEnumLanguagesByResourceLanguages(
  enumLanguages: Array<string>,
  resourceLanguages: Array<string>
) {
  return [
    ...resourceLanguages,
    ...enumLanguages?.filter((item) => !resourceLanguages.includes(item)),
  ];
}

const getEnumLanguages = (
  values: Array<Item> | undefined,
  languages: Array<string>
) => {
  if (!values) {
    return languages;
  }
  return values.length > 0
    ? sortEnumLanguagesByResourceLanguages(getLangsFromEnums(values), languages)
    : languages;
};

const createEmptyLocalizedEnum = (enumLanguages: Array<string>): Item => ({
  key: '',
  label: enumLanguages.reduce<Record<string, string>>(
    (acc, lang) => ({ ...acc, [lang]: '' }),
    {}
  ),
});

const createEmptyPlainEnum = (): Item => ({
  key: '',
  label: '',
});

const createEmptyEnumValue = (
  isLocalized: boolean,
  locales: Array<string> = []
): Item =>
  isLocalized && locales.length > 0
    ? createEmptyLocalizedEnum(locales)
    : createEmptyPlainEnum();

type Props = {
  onAddEnumValue: (item: Item) => void;
  onRemoveEnumValue: (absoluteIndex: number) => void;
  onChangeEnumValue: (args: {
    field: string;
    nextValue: string;
    absoluteIndex: number;
  }) => void;
  formik: {
    errors: Formik['errors'];
    touched: Formik['touched'];
    setFieldValue: Formik['setFieldValue'];
    setFieldTouched: Formik['setFieldTouched'];
    setTouched: Formik['setTouched'];
    values: TFormValues;
    handleChange: Formik['handleChange'];
  };
  isDisabled?: boolean;
};

const FieldDefinitionInputForEnum: FC<Props> = ({
  formik,
  onAddEnumValue,
  onRemoveEnumValue,
  onChangeEnumValue,
  isDisabled,
}) => {
  const intl = useIntl();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));

  const isLocalized = formik.values.isLocalized;
  const enumLanguages = getEnumLanguages(
    formik.values.enumValues,
    projectLanguages || []
  );

  const handleAddEnumClick = () => {
    onAddEnumValue(createEmptyEnumValue(isLocalized, enumLanguages));
  };

  const items =
    !formik.values.enumValues || formik.values.enumValues.length === 0
      ? [createEmptyEnumValue(isLocalized, projectLanguages)]
      : formik.values.enumValues;

  // Column keys: key, then one label column per language (localized) or a
  // single "label" column (plain), then a delete column.
  const labelColumnKeys = isLocalized
    ? enumLanguages.map((lang) => `label_${lang}`)
    : ['label'];
  const templateColumns = `1fr ${labelColumnKeys
    .map(() => '1fr')
    .join(' ')} max-content`;

  const cellValue = (item: Item, columnKey: string): string => {
    if (isLocalized && columnKey.startsWith('label')) {
      return getLocalizedEnumLabel(item.label as LocalizedString, columnKey);
    }
    if (columnKey === 'label') {
      return (item.label as string) || '';
    }
    return (item.key as string) || '';
  };

  return (
    <Stack direction="column" gap="300">
      <Grid templateColumns={templateColumns} gap="300" alignItems="center">
        <Text fontWeight="500">
          {intl.formatMessage(messages.tableHeaderLabelKey)}
        </Text>
        {isLocalized ? (
          enumLanguages.map((lang) => (
            <Text key={lang} fontWeight="500">
              {intl.formatMessage(messages.tableHeaderLocalizedLabelLabel, {
                language: lang.toUpperCase(),
              })}
            </Text>
          ))
        ) : (
          <Text fontWeight="500">
            {intl.formatMessage(messages.tableHeaderLabelLabel)}
          </Text>
        )}
        <Box />

        {items.map((item, index) => {
          const columnKeys = ['key', ...labelColumnKeys];
          return columnKeys
            .map((columnKey) => (
              <TextInput
                key={`${index}-${columnKey}`}
                aria-label={`${columnKey}-${index}`}
                value={cellValue(item, columnKey)}
                isDisabled={isDisabled}
                onChange={(nextValue) =>
                  onChangeEnumValue({
                    absoluteIndex: index,
                    field:
                      columnKey === 'key'
                        ? 'key'
                        : formToDocLocalizedEnumLabel(columnKey),
                    nextValue,
                  })
                }
                width={'full'}
              />
            ))
            .concat(
              <IconButton
                key={`${index}-delete`}
                aria-label={intl.formatMessage(messages.addEnumButtonLabel)}
                size="xs"
                variant="ghost"
                isDisabled={isDisabled || items.length === 1}
                onPress={() => onRemoveEnumValue(index)}
              >
                <Delete />
              </IconButton>
            );
        })}
      </Grid>
      <Box>
        <Button
          variant="outline"
          isDisabled={isDisabled}
          onPress={handleAddEnumClick}
        >
          <Add />
          {intl.formatMessage(messages.addEnumButtonLabel)}
        </Button>
      </Box>
    </Stack>
  );
};

export default FieldDefinitionInputForEnum;
