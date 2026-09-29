import { FC, useCallback, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useFormikContext } from 'formik';
import {
  Box,
  Button,
  DraggableList,
  Flex,
  Grid,
  IconButton,
  Stack,
  Text,
  TextInput,
} from '@commercetools/nimbus';
import { Add, Delete, DragIndicator } from '@commercetools/nimbus-icons';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import messages from './messages';
import { Item, LocalizedString } from './constants';
import { TFormValues } from '../field-definition-input/helpers';

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
  _uid: crypto.randomUUID(),
  key: '',
  label: enumLanguages.reduce<Record<string, string>>(
    (acc, lang) => ({ ...acc, [lang]: '' }),
    {}
  ),
});

const createEmptyPlainEnum = (): Item => ({
  _uid: crypto.randomUUID(),
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
  onReorderEnumValues: (items: Array<Item>) => void;
  isDisabled?: boolean;
};

const FieldDefinitionInputForEnum: FC<Props> = ({
  onAddEnumValue,
  onRemoveEnumValue,
  onChangeEnumValue,
  onReorderEnumValues,
  isDisabled,
}) => {
  const formik = useFormikContext<TFormValues>();
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

  // Before the user has added a real value, `items` falls back to a single
  // placeholder row not yet stored in Formik state. That placeholder must
  // keep the same `_uid` across renders — regenerating it (or the `items`/
  // `draggableItems` arrays below) on every render would make DraggableList
  // think the whole collection changed identity every render, which its
  // internal sync effect turns into an infinite update loop.
  const emptyItemRef = useRef<Item | undefined>(undefined);
  if (!emptyItemRef.current) {
    emptyItemRef.current = createEmptyEnumValue(isLocalized, projectLanguages);
  }

  const items = useMemo(
    () =>
      !formik.values.enumValues || formik.values.enumValues.length === 0
        ? [emptyItemRef.current as Item]
        : formik.values.enumValues,
    [formik.values.enumValues]
  );

  // DraggableList requires its item type to satisfy DraggableListItemData
  // (`label?: ReactNode`), but a LocalizedEnum's `Item.label` is a
  // `{ [locale]: string }` record, not a ReactNode — so items are wrapped
  // rather than fed to DraggableList directly. Memoized on `items` (not
  // recomputed on every render) for the same reason as `emptyItemRef` above.
  const draggableItems = useMemo(
    () => items.map((item) => ({ _uid: item._uid, item })),
    [items]
  );

  // Column keys: key, then one label column per language (localized) or a
  // single "label" column (plain), then a delete column.
  const labelColumnKeys = isLocalized
    ? enumLanguages.map((lang) => `label_${lang}`)
    : ['label'];
  // `minmax(0, 1fr)`, not plain `1fr` (which is `minmax(auto, 1fr)`) — a
  // bare `1fr` track won't shrink below its content's min-content width
  // (each TextInput's natural minimum), so with many language columns the
  // row overflows past the header's width instead of matching it.
  const templateColumns = `minmax(0, 1fr) ${labelColumnKeys
    .map(() => 'minmax(0, 1fr)')
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

  const getItemKey = useCallback(
    (wrapper: { _uid: string }) => wrapper._uid,
    []
  );

  // GridListItem (which DraggableList.Item renders under the hood) requires
  // a non-empty `textValue` for type-to-select accessibility whenever its
  // children aren't plain text — true here since each row renders a Grid of
  // TextInputs. The enum key is the row's primary identifier, so it's the
  // most useful thing to type-to-select against; fall back to a static
  // string for a still-blank new row rather than passing an empty string,
  // which react-aria treats the same as a missing textValue.
  const getItemTextValue = useCallback(
    (item: Item) =>
      item.key?.trim() || intl.formatMessage(messages.newEnumValueTextValue),
    [intl]
  );

  const handleUpdateItems = useCallback(
    (updatedWrappers: Array<{ _uid: string; item: Item }>) => {
      // DraggableList has no simple "disable the whole list" prop, so guard
      // here instead — mirrors the isDisabled gating already applied to
      // each row's TextInput/delete button.
      if (!isDisabled) {
        onReorderEnumValues(updatedWrappers.map((wrapper) => wrapper.item));
      }
    },
    [isDisabled, onReorderEnumValues]
  );

  return (
    <Stack direction="column" gap="300">
      <Flex alignItems="center" gap="200" paddingX="200">
        {/* DraggableList.Root insets its rows with its own padding="200",
            and each row's real drag-handle icon button sits to the left of
            its content — neither of which the header (rendered outside the
            list) gets by default, so both are mirrored here to keep the
            header's columns lined up with each row's. */}
        <IconButton
          aria-hidden
          isDisabled
          visibility="hidden"
          size="2xs"
          variant="ghost"
          colorPalette="neutral"
        >
          <DragIndicator />
        </IconButton>
        <Grid
          flex="1"
          minWidth={0}
          templateColumns={templateColumns}
          gap="300"
          alignItems="center"
        >
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
        </Grid>
      </Flex>
      <DraggableList.Root<{ _uid: string; item: Item }>
        items={draggableItems}
        getKey={getItemKey}
        onUpdateItems={handleUpdateItems}
        aria-label={intl.formatMessage(messages.tableHeaderLabelKey)}
        width="full"
      >
        {(wrapper) => {
          const item = wrapper.item;
          const absoluteIndex = items.findIndex(
            (candidate) => candidate._uid === item._uid
          );
          const columnKeys = ['key', ...labelColumnKeys];
          return (
            <DraggableList.Item
              id={wrapper._uid}
              textValue={getItemTextValue(item)}
            >
              <Grid
                templateColumns={templateColumns}
                gap="300"
                alignItems="center"
                width="full"
                minWidth={0}
              >
                {columnKeys.map((columnKey) => (
                  <TextInput
                    key={columnKey}
                    aria-label={`${columnKey}-${absoluteIndex}`}
                    value={cellValue(item, columnKey)}
                    isDisabled={isDisabled}
                    onChange={(nextValue) =>
                      onChangeEnumValue({
                        absoluteIndex,
                        field:
                          columnKey === 'key'
                            ? 'key'
                            : formToDocLocalizedEnumLabel(columnKey),
                        nextValue,
                      })
                    }
                    width={'full'}
                  />
                ))}
                <IconButton
                  aria-label={intl.formatMessage(messages.addEnumButtonLabel)}
                  size="xs"
                  variant="ghost"
                  isDisabled={isDisabled || items.length === 1}
                  onPress={() => onRemoveEnumValue(absoluteIndex)}
                >
                  <Delete />
                </IconButton>
              </Grid>
            </DraggableList.Item>
          );
        }}
      </DraggableList.Root>
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
