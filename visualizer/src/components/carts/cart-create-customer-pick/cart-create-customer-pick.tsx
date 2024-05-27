import { FC, useCallback, useEffect, useState } from 'react';
import messages from './messages';
import { useIntl } from 'react-intl';
import useCustomerSearchFetcher from '../../../hooks/use-customer-search-fetcher';
import { DOMAINS, NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  useShowApiErrorNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import SearchTextInput from '@commercetools-uikit/search-text-input';
import { debounce } from 'lodash';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import {
  columnDefinitions,
  hiddenColumnsDefinition,
} from './column-definitions';
import {
  TCart,
  TCartUpdateAction,
  TCustomer,
} from '../../../types/generated/ctp';
import { usePaginationState } from '@commercetools-uikit/hooks';
import { Pagination } from '@commercetools-uikit/pagination';
import { StepProps } from '../cart-create/cart-create';
import StepperToolbar from '../../save-toolbar/StepperToolbar';
import { useHistory } from 'react-router';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useCartUpdater } from '../../../hooks/use-carts-hook';
import { useCustomerFetcher } from '../../../hooks/use-customers-hook';
import Constraints from '@commercetools-uikit/constraints';
import TextInput from '@commercetools-uikit/text-input';
import formatCustomerName from '../../../utils/format-customer-name';
import Tooltip from '@commercetools-uikit/tooltip';
import IconButton from '@commercetools-uikit/icon-button';
import { CloseBoldIcon } from '@commercetools-uikit/icons';

type Props = StepProps & { cart: TCart };

export const CartCreateCustomerPick: FC<Props> = ({
  currentStep,
  goToNextStep,
  goToPreviousStep,
  totalSteps,
  linkToWelcome,
  cart,
}) => {
  const intl = useIntl();
  const history = useHistory();
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const [searchValue, setSearchValue] = useState('');
  const { page, perPage } = usePaginationState();

  const { customer, loading } = useCustomerFetcher({
    id: cart.customerId || '',
  });

  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const cartUpdater = useCartUpdater();

  const handleMaximumQueryLimitReached = useCallback(() => {
    showNotification({
      kind: 'warning',
      domain: DOMAINS.PAGE,
      text: intl.formatMessage(messages.invalidInputError),
    });
  }, [showNotification, intl]);

  const handleSearchServiceNotAvailableError = useCallback(() => {
    showNotification({
      kind: 'error',
      domain: DOMAINS.PAGE,
      text: intl.formatMessage(messages.searchServiceNotAvailableError),
    });
  }, [intl, showNotification]);

  const handleErrors = useCallback(
    (error) => {
      if (error.code >= 400) {
        if (
          error.message ===
          "Invalid value for: body (Offset must be between 0 and 9900. at 'offset')"
        ) {
          handleMaximumQueryLimitReached();
        } else {
          showApiErrorNotification({ errors: error.body.errors });
        }
      } else if (error.code >= 500) {
        handleSearchServiceNotAvailableError();
      }
    },
    [
      handleMaximumQueryLimitReached,
      handleSearchServiceNotAvailableError,
      showApiErrorNotification,
    ]
  );

  const [tableData, setTableData] = useState({
    columns: [...columnDefinitions, ...hiddenColumnsDefinition],
    visibleColumns: columnDefinitions,
    visibleColumnKeys: columnDefinitions.map((column) => column.key),
  });

  const [isCondensed, setIsCondensed] = useState<boolean>(true);
  const [isWrappingText, setIsWrappingText] = useState<boolean>(false);

  const columnManager = {
    disableColumnManager: false,
    hideableColumns: tableData.columns,
    visibleColumnKeys: tableData.visibleColumnKeys,
  };
  const onSettingChange = (action: string, nextValue: boolean | string[]) => {
    const {
      COLUMNS_UPDATE,
      IS_TABLE_CONDENSED_UPDATE,
      IS_TABLE_WRAPPING_TEXT_UPDATE,
    } = UPDATE_ACTIONS;

    switch (action) {
      case IS_TABLE_CONDENSED_UPDATE: {
        setIsCondensed(nextValue as boolean);
        break;
      }
      case IS_TABLE_WRAPPING_TEXT_UPDATE: {
        setIsWrappingText(nextValue as boolean);
        break;
      }
      case COLUMNS_UPDATE: {
        if (Array.isArray(nextValue)) {
          Array.isArray(nextValue) &&
            setTableData({
              ...tableData,
              visibleColumns: tableData.columns.filter((column) =>
                nextValue.includes(column.key)
              ),
              visibleColumnKeys: nextValue,
            });
        }
        break;
      }
    }
  };

  const { customerData, fetchCustomers } = useCustomerSearchFetcher(
    { searchQuery: searchValue, page: page.value, perPage: perPage.value },
    handleErrors
  );

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      setSearchValue(searchQuery);
    }, 500),
    []
  );

  useEffect(() => {
    fetchCustomers && fetchCustomers();
  }, [searchValue, page.value, perPage.value]);
  if (!customerData || customerData.isLoading) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  const handleClearCustomerSelection = async () => {
    const updateActions: Array<TCartUpdateAction> = [];

    updateActions.push({
      setCustomerEmail: { email: null },
    });
    updateActions.push({
      setCustomerId: { customerId: null },
    });

    await cartUpdater.execute({
      updateActions: updateActions,
      id: cart.id,
      version: cart.version,
      locale: dataLocale,
    });
  };

  const handleRowClick = async (row: TCustomer) => {
    if (!row) {
      return;
    }
    const updateActions: Array<TCartUpdateAction> = [];

    if (row.email) {
      updateActions.push({
        setCustomerEmail: { email: row.email },
      });
    }
    if (row.id) {
      updateActions.push({
        setCustomerId: { customerId: row.id },
      });
    }

    await cartUpdater.execute({
      updateActions: updateActions,
      id: cart.id,
      version: cart.version,
      locale: dataLocale,
    });
    showNotification({
      kind: 'success',
      domain: DOMAINS.SIDE,
      text: intl.formatMessage(messages.updateSuccess),
    });
  };

  const itemRenderer = (item: TCustomer, column: TColumn<TCustomer>) => {
    switch (column.key) {
      case 'customerGroup':
        return item[column.key] ? item[column.key]?.name : NO_VALUE_FALLBACK;
      case 'createdAt':
      case 'lastModifiedAt':
        return `${intl.formatDate(item[column.key])} ${intl.formatTime(
          item[column.key]
        )}`;
      case 'email':
      case 'companyName':
      case 'firstName':
      case 'lastName':
      case 'middleName':
      case 'vatId':
      case 'externalId':
      case 'dateOfBirth':
      case 'customerNumber':
        return item[column.key] || NO_VALUE_FALLBACK;
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (item as any)[column.key];
    }
  };
  return (
    <>
      {customer ? (
        <>
          <Spacings.Stack scale="s">
            <Constraints.Horizontal max="scale">
              <Spacings.Inline alignItems="center">
                <TextInput
                  isDisabled={true}
                  onChange={() => {}}
                  value={`${formatCustomerName({
                    firstName: customer?.firstName,
                    lastName: customer?.lastName,
                  })} (${customer?.email})`}
                />

                <Tooltip
                  title={intl.formatMessage(
                    messages.removeCustomerSelectionTooltip
                  )}
                >
                  <IconButton
                    icon={<CloseBoldIcon />}
                    label={intl.formatMessage(messages.removeCustomerSelection)}
                    onClick={handleClearCustomerSelection}
                    shape="square"
                    size="big"
                  />
                </Tooltip>
              </Spacings.Inline>
            </Constraints.Horizontal>
          </Spacings.Stack>
          <StepperToolbar
            isVisible={true}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onCancel={() => {
              history.replace({
                pathname: linkToWelcome + '/carts',
              });
            }}
          />
        </>
      ) : (
        <Spacings.Stack scale="xl">
          <SearchTextInput
            placeholder={intl.formatMessage(messages.searchBarPlaceholder)}
            value={searchValue}
            onChange={(event) => debouncedSearch(event.target.value)}
            onReset={() => setSearchValue('')}
            onSubmit={() => console.log('submits')}
          />
          {customerData?.customers?.count &&
          customerData?.customers?.count > 0 ? (
            <Spacings.Stack scale="m">
              <DataTableManager
                columns={tableData.visibleColumns}
                columnManager={columnManager}
                onSettingsChange={onSettingChange}
                displaySettings={{
                  isWrappingText,
                  isCondensed,
                  disableDisplaySettings: false,
                }}
              >
                <DataTable<TCustomer>
                  rows={customerData?.customers?.results || []}
                  columns={tableData.visibleColumns}
                  itemRenderer={itemRenderer}
                  onRowClick={(customer) => handleRowClick(customer)}
                />
              </DataTableManager>
              <Pagination
                page={page.value}
                onPageChange={page.onChange}
                perPage={perPage.value}
                onPerPageChange={perPage.onChange}
                totalItems={customerData?.customers?.total}
              />
            </Spacings.Stack>
          ) : (
            <>No items</>
          )}
        </Spacings.Stack>
      )}
    </>
  );
};

export default CartCreateCustomerPick;
