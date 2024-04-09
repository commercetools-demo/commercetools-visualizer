import { FC, lazy } from 'react';
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
  TTypeUpdateAction,
} from '../../../types/generated/ctp';
import createColumnDefinitions from './field-definitions-list-column-definitions';
import messages from './messages';
import { useTypeDefinitionEntryCreator } from '../../../hooks/use-types-connector/types-connector';
import { renderAttributeTypeName } from './render-attribute-type-name';

const NewFieldDefinitionInput = lazy(
  () => import('../field-definition-create/field-definition-create')
);
const FieldDefinitionInput = lazy(
  () => import('../field-definition-edit/field-definition-edit')
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

const FieldDefinitionsList: FC<Props> = ({
  id,
  value,
  refetch,
  linkToHome,
  version,
}) => {
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

  const rowClick = async (
    row: TFieldDefinitionWithId,
    _rowIndex: number,
    columnKey: string
  ) => {
    if (columnKey === 'delete') {
      await deleteItem(row.name);
    } else {
      push(`${match.url}/${row.name}`);
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
          return <CheckActiveIcon color={'primary'} />;
        } else {
          return <CheckInactiveIcon color={'neutral60'} />;
        }
      case 'type': {
        return renderAttributeTypeName(item.type);
      }
      case 'set': {
        switch (item.type.name) {
          case 'Set': {
            return <CheckActiveIcon color={'primary'} />;
          }
        }
        return <CheckInactiveIcon color={'neutral60'} />;
      }
      case 'delete':
        return <IconButton label="" size={'medium'} icon={<BinFilledIcon />} />;
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
          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <SecondaryButton
              onClick={() => {
                push(`${linkToHome}/${id}/${version}/new`);
              }}
              iconLeft={<PlusBoldIcon />}
              label={intl.formatMessage(messages.addField)}
            />
          </div>
          <DataTable<TFieldDefinitionWithId>
            columns={createColumnDefinitions(intl.formatMessage)}
            isCondensed={true}
            rows={fields}
            itemRenderer={itemRendered}
            onRowClick={rowClick}
          />
          <Switch>
            <SuspendedRoute path={`${linkToHome}/:id/:version/new`}>
              <NewFieldDefinitionInput
                onClose={() => {
                  refetch && refetch();
                  push(`${match.url}`);
                }}
              />
            </SuspendedRoute>
            <SuspendedRoute path={`${linkToHome}/:id/:fieldDefinitionName`}>
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

FieldDefinitionsList.displayName = 'FieldTable';

export default FieldDefinitionsList;
