import { FC } from 'react';
import {
  CustomFormModalPage,
  PageContentWide,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { useHistory, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import messages from './messages';
import {
  getErrorMessage,
  graphQLErrorHandler,
  useCartDeleter,
  useCartFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';

import CartDetailsGeneralInfoHeader from '../cart-details-general-info-header';
import Card from '@commercetools-uikit/card';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import {
  AddressesPanel,
  CartSummaryPricingBreakdown,
  CartDetailsItems,
} from 'commercetools-demo-shared-cart-handling';

type Props = {
  onClose: () => void;
  linkToHome: string;
};

const CartDetails: FC<Props> = ({ onClose, linkToHome }) => {
  const { id } = useParams<{ id: string }>();
  const { push } = useHistory();
  const showNotification = useShowNotification();
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const { cart, error, loading } = useCartFetcher({
    id: id,
    locale: dataLocale,
  });

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const cartDeleter = useCartDeleter();

  const handleDelete = async () => {
    if (cart) {
      await cartDeleter
        .execute({
          id: cart.id,
          version: cart.version,
        })
        .then(() => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.deleteSuccess),
          });
          onClose();
        })
        .catch(graphQLErrorHandler(showNotification));
    }
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
  if (!cart) {
    return <PageNotFound />;
  }

  return (
    <CustomFormModalPage
      title={intl.formatMessage(messages.title, { id: id })}
      isOpen
      onClose={onClose}
      formControls={
        <>
          <CustomFormModalPage.FormPrimaryButton
            label={intl.formatMessage(messages.edit)}
            onClick={() => push(`${linkToHome}/edit/${id}`)}
            isDisabled={!canManage}
          />
          <CustomFormModalPage.FormDeleteButton
            onClick={() => handleDelete()}
            isDisabled={!canManage}
          />
        </>
      }
    >
      <PageContentWide>
        <Spacings.Stack scale="xl">
          <CartDetailsGeneralInfoHeader cart={cart} />
          {(cart.lineItems.length >= 1 || cart.customLineItems.length >= 1) && (
            <CartDetailsItems cart={cart} />
          )}
          {(cart.lineItems.length >= 1 || cart.customLineItems.length >= 1) && (
            <Card type="raised">
              <CartSummaryPricingBreakdown cart={cart} />
            </Card>
          )}
          <AddressesPanel cart={cart} />
        </Spacings.Stack>
      </PageContentWide>
    </CustomFormModalPage>
  );
};

export default CartDetails;
