import React, { FC, useState } from 'react';
import { useIntl } from 'react-intl';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import IconButton from '@commercetools-uikit/icon-button';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import {
  CheckActiveIcon,
  CheckInactiveIcon,
  BinFilledIcon,
} from '@commercetools-uikit/icons';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import FieldDefinitionInput from '../field-definition-input';
import {
  TFieldDefinition,
  TReferenceType,
  TSetType,
} from '../../../types/generated/ctp';
import createColumnDefinitions from './field-column-definitions';
import messages from './field-messages';

type Props = {
  id?: string;
  value: Array<TFieldDefinition>;
  onChange?: (identifier: string, value: any) => void;
  onBlur?: (e: React.FocusEvent<any>) => void;
  isDisabled?: boolean;
  hasError?: boolean;
  hasWarning?: boolean;
};

type TFieldDefinitionWithId = { id: string } & TFieldDefinition;

const FieldTable: FC<Props> = ({ id, value, onChange }) => {
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));
  const fields: Array<TFieldDefinitionWithId> = value.map((item, index) => {
    return { ...item, id: index + '' };
  });
  const editField = null;
  const addField = null;

  const [FieldDefinitionInputOpen, setFieldDefinitionInputOpen] =
    useState(false);

  const [FieldDefinitionInputData, setFieldDefinitionInputData] = useState();

  const deleteItem = (name: string) => {
    const newSet = fields.filter((item) => item.name !== name);
    onChange && onChange('fieldDefinitions', newSet);
  };

  function formToDoc(fd: any) {
    if (!fd.isSet) {
      return fd;
    }
    return {
      ...fd,
      type: {
        name: 'Set',
        elementType: fd.type,
      },
    };
  }

  const updateFieldDefinition = (FieldDefinition: any) => {
    const newSet = fields.concat([formToDoc(FieldDefinition)]);
    setFieldDefinitionInputOpen(false);
    onChange && onChange('fieldDefinitions', newSet);
  };

  const rowClick = (row: any, rowIndex: number, columnKey: string) => {
    if (columnKey === 'delete') {
      deleteItem(row.name);
    }
    return;
  };

  const itemRendered = (
    item: TFieldDefinitionWithId,
    column: TColumn<TFieldDefinitionWithId>
  ) => {
    switch (column.key) {
      case 'name':
        return item.name;
      case 'label':
        return formatLocalizedString(
          {
            name: transformLocalizedFieldToLocalizedString(
              item.labelAllLocales ?? []
            ),
          },
          {
            key: 'name',
            locale: dataLocale,
            fallbackOrder: projectLanguages,
            fallback: NO_VALUE_FALLBACK,
          }
        );
      case 'required':
        if (item.required) {
          return <CheckActiveIcon />;
        } else {
          return <CheckInactiveIcon />;
        }
      case 'type': {
        switch (item.type.name) {
          case 'Reference': {
            const ref = item.type as TReferenceType;
            return `${ref.name} (${ref.referenceTypeId})`;
          }
          case 'Set': {
            const ref = item.type as TSetType;
            return `${ref.name} (${ref.elementType.name})`;
          }
        }
        return item.type.name;
      }
      case 'delete':
        return <IconButton label="" icon={<BinFilledIcon />} />;
      default:
        return (item as any)[column.key] || '';
    }
  };
  return (
    <>
      <div style={{ display: 'block', width: '100%' }}>
        <FieldDefinitionInput
          isOpen={FieldDefinitionInputOpen}
          onClose={() => {
            setFieldDefinitionInputOpen(false);
          }}
          onSubmit={updateFieldDefinition}
          existingFieldDefinition={FieldDefinitionInputData}
        />
        <Spacings.Stack scale="m">
          <Spacings.Inline justifyContent="space-between">
            <Text.Headline as="h3" intlMessage={messages.fieldHeaderTitle} />
            {/* <SecondaryButton
              onClick={() => {setFieldDefinitionInputOpen(true);}}
              }}
              iconLeft={<PlusBoldIcon />}
              label={intl.formatMessage(messages.addField)}
            /> */}
          </Spacings.Inline>
          <DataTable<TFieldDefinitionWithId>
            columns={createColumnDefinitions(intl.formatMessage)}
            isCondensed={false}
            rows={fields}
            itemRenderer={itemRendered}
            onRowClick={rowClick}
          />
        </Spacings.Stack>
      </div>
    </>
  );
};

FieldTable.displayName = 'FieldTable';

export default FieldTable;
