import { FC, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { DOMAINS } from '@commercetools-frontend/constants';
import createColumnsDefinitions from './column-definitions';
import messages from './messages';
import { formatMoney, getErrorMessage } from '../../../helpers';
import RadioInput from '@commercetools-uikit/radio-input';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import Constraints from '@commercetools-uikit/constraints';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { Link } from 'react-router-dom';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import {
  TCart,
  TShippingMethod,
  TShippingRate,
} from '../../../types/generated/ctp';
import {
  useShowApiErrorNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import {
  useCartUpdater,
  useFetchShippingMethodsByCartFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { StepProps } from '../cart-create/cart-create';
import { useHistory } from 'react-router';
import { SaveToolbar } from 'commercetools-demo-shared-save-toolbar';
import {
  Address,
  AddressContainer,
} from 'commercetools-demo-shared-cart-handling';

type Props = {
  cart: TCart;
} & StepProps;

const CartCreateSetShippingMethod: FC<Props> = ({
  cart,
  currentStep,
  goToNextStep,
  totalSteps,
  linkToWelcome,
  goToPreviousStep,
}) => {
  const history = useHistory();
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const intl = useIntl();
  const cartUpdater = useCartUpdater();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const { loading, shippingMethodsByCart, error } =
    useFetchShippingMethodsByCartFetcher({
      id: cart.id || '',
      locale: dataLocale,
    });

  const setShippingMethodToCart = (shippingMethod: TShippingMethod) => {
    cartUpdater
      .execute({
        actions: [
          {
            setShippingMethod: {
              shippingMethod: {
                id: shippingMethod.id,
                typeId: 'shipping-method',
              },
            },
          },
        ],
        id: cart.id || '',
        version: cart.version,
        locale: dataLocale,
      })
      .then(
        () => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.shippingMethodUpdated),
          });
        },
        (graphQLErrors) => {
          showApiErrorNotification({
            errors: graphQLErrors,
          });
        }
      );
  };

  useEffect(() => {
    if (!loading && !error) {
      // In case the user has a default shipping method we set it
      // as the shipping method of the cart directly
      const defaultShippingMethod =
        shippingMethodsByCart &&
        shippingMethodsByCart?.find(
          (shippingMethod) => shippingMethod.isDefault
        );
      if (defaultShippingMethod && !cart.shippingInfo && !cartUpdater.loading) {
        setShippingMethodToCart(defaultShippingMethod);
      }
    }
  }, [
    cart.shippingInfo,
    cartUpdater.loading,
    error,
    loading,
    shippingMethodsByCart,
  ]);

  const renderItem = (
    shippingMethod: TShippingMethod,
    column: TColumn<TShippingMethod>
  ) => {
    let findBestMatchingRate: TShippingRate | undefined;
    shippingMethod.zoneRates.forEach((zoneRate) =>
      zoneRate.shippingRates.forEach((rate) => {
        if (rate.isMatching) {
          findBestMatchingRate = rate;
          return;
        }
      })
    );
    switch (column.key) {
      case 'check':
        return (
          <RadioInput.Option
            data-testid={`radio-shipping-${shippingMethod.id}`}
            hasError={Boolean(
              false
              // state.shippingMethodError[shippingMethod.id]
            )}
            isChecked={
              cart?.shippingInfo?.shippingMethod?.id === shippingMethod.id
            }
            isDisabled={cartUpdater.loading}
            onChange={() => ({})}
            value={shippingMethod.id}
          >
            {''}
          </RadioInput.Option>
        );
      case 'name':
        return shippingMethod.name;
      case 'description':
        return shippingMethod.localizedDescription;
      case 'taxCategory':
        return shippingMethod.taxCategory?.name || '';
      case 'isDefault':
        return shippingMethod.isDefault ? (
          <FormattedMessage {...messages.yes} />
        ) : (
          <FormattedMessage {...messages.no} />
        );
      case 'shippingRate':
        return formatMoney(findBestMatchingRate?.price, intl);
      case 'freeAbove':
        return findBestMatchingRate?.freeAbove
          ? formatMoney(findBestMatchingRate?.freeAbove, intl)
          : '-';
      default:
        return undefined;
    }
  };

  const handleSetShippingMethod = (shippingMethod: TShippingMethod) => {
    // If the cart does not have shipping info assigned yet
    if (!cart?.shippingInfo) {
      setShippingMethodToCart(shippingMethod);
    }
    // if the cart has already shipping info but the selected shipping method
    // is not the same as the one in the cart
    else if (
      shippingMethod.id !== cart.shippingInfo?.shippingMethod?.id &&
      !cartUpdater.loading
    ) {
      setShippingMethodToCart(shippingMethod);
    }

    // setState({ shippingMethodError: {} });
  };

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }
  if (!shippingMethodsByCart) {
    return <PageNotFound />;
  }

  const hasShippingMethodsByCart = shippingMethodsByCart?.length > 0;

  return (
    <>
      <Spacings.Stack scale="m">
        <Constraints.Horizontal max={11}>
          <Spacings.Stack scale="s">
            <Text.Headline as="h2" intlMessage={messages.title} />
            <Text.Subheadline as="h5" intlMessage={messages.subTitle} />
          </Spacings.Stack>
        </Constraints.Horizontal>
        <Spacings.Stack scale="xs">
          <CollapsiblePanel
            header={
              <CollapsiblePanel.Header>
                <FormattedMessage {...messages.shippingAddressTitle} />
              </CollapsiblePanel.Header>
            }
          >
            <Constraints.Horizontal max={11}>
              <Spacings.Stack scale="m">
                <AddressContainer>
                  <Address address={cart?.shippingAddress} />
                </AddressContainer>
              </Spacings.Stack>
            </Constraints.Horizontal>
          </CollapsiblePanel>

          <CollapsiblePanel
            header={
              <CollapsiblePanel.Header>
                <FormattedMessage {...messages.shippingMethodsTitle} />
              </CollapsiblePanel.Header>
            }
          >
            {loading ? (
              <LoadingSpinner />
            ) : !hasShippingMethodsByCart ? (
              <Spacings.Stack scale="xs">
                <Text.Body intlMessage={messages.noAvailableShippingMethods} />
                <Link to={'props.routes.orderCreateAddShippingMethod.getUrl()'}>
                  <FormattedMessage {...messages.addShippingMethod} />
                </Link>
              </Spacings.Stack>
            ) : (
              <Spacings.Stack alignItems="flex-start" scale="m">
                <Constraints.Horizontal max="scale">
                  <DataTable
                    columns={createColumnsDefinitions(intl)}
                    itemRenderer={renderItem}
                    onRowClick={handleSetShippingMethod}
                    rows={shippingMethodsByCart}
                  />
                </Constraints.Horizontal>
              </Spacings.Stack>
            )}
          </CollapsiblePanel>
        </Spacings.Stack>
      </Spacings.Stack>
      <SaveToolbar
        isVisible={true}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={() => {
          goToNextStep && goToNextStep();
        }}
        onBack={goToPreviousStep}
        onCancel={() => {
          history.replace({
            pathname: linkToWelcome + '/carts',
          });
        }}
      />
    </>
  );
};

export default CartCreateSetShippingMethod;
