import React, { FC, lazy } from 'react';
import { useIntl } from 'react-intl';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import IconButton from '@commercetools-uikit/icon-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import {
  CheckActiveIcon,
  CheckInactiveIcon,
  BinFilledIcon,
  PlusBoldIcon,
} from '@commercetools-uikit/icons';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { DOMAINS, NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import { ApolloQueryResult } from '@apollo/client';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import {
  TFieldDefinition,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TReferenceType,
  TSetType,
  TTypeUpdateAction,
} from '../../../types/generated/ctp';
import NewFieldDefinitionInput from '../field-definition-input/NewFieldDefinitionInput';
import { useTypeDefinitionEntryCreator } from '../type-definition-connectors';
import createColumnDefinitions from './field-column-definitions';
import messages from './field-messages';

const FieldDefinitionInput = lazy(
  () => import('../field-definition-input/FieldDefinitionInput')
);

type Props = {
  id: string;
  version: number;
  value: Array<TFieldDefinition>;
  linkToHome: string;
  refetch?: (
    variables?: Partial<TQuery_TypeDefinitionArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

type TFieldDefinitionWithId = { id: string } & TFieldDefinition;

const FieldTable: FC<Props> = ({ id, value, refetch, linkToHome, version }) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const typeDefinitionCreator = useTypeDefinitionEntryCreator();
  const showNotification = useShowNotification();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));
  const fields: Array<TFieldDefinitionWithId> = value.map((item, index) => {
    return { ...item, id: index + '' };
  });

  const deleteItem = async (name: string) => {
    const deleteAction: TTypeUpdateAction = {
      removeFieldDefinition: { fieldName: name },
    };
    await typeDefinitionCreator.execute({
      actions: [deleteAction],
      id: id,
      version: version,
    });
    showNotification({
      kind: 'success',
      domain: DOMAINS.SIDE,
      text: intl.formatMessage(messages.removeFieldDefinitionButtonSuccess),
    });
    refetch && refetch();
  };

  const rowClick = (
    row: TFieldDefinitionWithId,
    rowIndex: number,
    columnKey: string
  ) => {
    if (columnKey === 'delete') {
      deleteItem(row.name);
    } else {
      push(`${linkToHome}/types/${id}/${row.name}`);
    }
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
        {/* <FieldDefinitionInput
          isOpen={FieldDefinitionInputOpen}
          onClose={() => {
            setFieldDefinitionInputOpen(false);
          }}
          onSubmit={updateFieldDefinition}
          existingFieldDefinition={FieldDefinitionInputData}
        /> */}
        <Spacings.Stack scale="m">
          <Spacings.Inline justifyContent="space-between">
            <Text.Headline as="h3" intlMessage={messages.fieldHeaderTitle} />
            <SecondaryButton
              onClick={() => {
                push(`${linkToHome}/types/${id}/${version}/new`);
              }}
              iconLeft={<PlusBoldIcon />}
              label={intl.formatMessage(messages.addField)}
            />
          </Spacings.Inline>
          <DataTable<TFieldDefinitionWithId>
            columns={createColumnDefinitions(intl.formatMessage)}
            isCondensed={false}
            rows={fields}
            itemRenderer={itemRendered}
            onRowClick={rowClick}
          />
          <Switch>
            <SuspendedRoute path={`${linkToHome}/types/:id/:version/new`}>
              <NewFieldDefinitionInput
                onClose={() => {
                  refetch && refetch();
                  push(`${match.url}`);
                }}
              />
            </SuspendedRoute>
            <SuspendedRoute
              path={`${linkToHome}/types/:id/:fieldDefinitionName`}
            >
              <FieldDefinitionInput
                onClose={() => {
                  refetch && refetch();
                  push(`${match.url}`);
                }}
              />
            </SuspendedRoute>
          </Switch>
        </Spacings.Stack>
      </div>
    </>
  );
};

FieldTable.displayName = 'FieldTable';

export default FieldTable;
