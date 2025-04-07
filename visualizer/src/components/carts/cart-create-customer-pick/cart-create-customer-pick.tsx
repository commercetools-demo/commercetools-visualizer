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
import { StepProps } from '../cart-create/cart-create';
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
import {
  formatDateAndTime,
  renderDefault,
  PaginatableDataTable,
} from 'commercetools-demo-shared-paginatable-data-table';
import { TDataTableProps } from '@commercetools-uikit/data-table/dist/declarations/src/data-table';
import { SaveToolbar } from 'commercetools-demo-shared-save-toolbar';

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
  const paginationState = usePaginationState();

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

  const { customerData, fetchCustomers } =
    useCustomerSearchFetcher(handleErrors);

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      setSearchValue(searchQuery);
    }, 500),
    []
  );

  useEffect(() => {
    fetchCustomers &&
      fetchCustomers({
        searchQuery: searchValue,
        page: paginationState.page.value,
        perPage: paginationState.perPage.value,
      });
  }, [searchValue, paginationState.page.value, paginationState.perPage.value]);
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
      actions: updateActions,
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
      actions: updateActions,
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

  const itemRenderer: TDataTableProps<TCustomer>['itemRenderer'] = (
    item,
    column
  ) => {
    switch (column.key) {
      case 'customerGroup':
        return item[column.key] ? item[column.key]?.name : NO_VALUE_FALLBACK;
      case 'createdAt':
      case 'lastModifiedAt':
        return formatDateAndTime(item[column.key], intl);
      default:
        return renderDefault(item[column.key as keyof TCustomer]);
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
          <SaveToolbar
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
            <PaginatableDataTable<TCustomer>
              rows={customerData?.customers?.results || []}
              columns={[...columnDefinitions, ...hiddenColumnsDefinition]}
              visibleColumns={columnDefinitions}
              itemRenderer={itemRenderer}
              onRowClick={(customer) => handleRowClick(customer)}
              totalItems={customerData?.customers?.total}
            />
          ) : (
            <>No items</>
          )}
        </Spacings.Stack>
      )}
    </>
  );
};

export default CartCreateCustomerPick;
