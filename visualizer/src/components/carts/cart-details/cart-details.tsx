import { FC } from 'react';
import {
  InfoModalPage,
  PageContentWide,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import messages from './messages';
import { useCartFetcher } from '../../../hooks/use-carts-hook';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';

import AddressesPanel from '../addresses-panel';
import CartDetailsGeneralInfoHeader from '../cart-details-general-info-header';
import Card from '@commercetools-uikit/card';
import CartSummaryPricingBreakdown from '../cart-summary-pricing-breakdown';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

type Props = {
  onClose: () => void;
};

const CartDetails: FC<Props> = ({ onClose }) => {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const { cart, error, loading } = useCartFetcher({
    id: id,
    locale: dataLocale,
  });

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
    <InfoModalPage
      title={intl.formatMessage(messages.title, { id: id })}
      isOpen
      onClose={onClose}
    >
      <PageContentWide>
        <Spacings.Stack scale="xl">
          <CartDetailsGeneralInfoHeader cart={cart} />
          <Card type="raised">
            <CartSummaryPricingBreakdown cart={cart} />
          </Card>
          <AddressesPanel cart={cart} />
        </Spacings.Stack>
      </PageContentWide>
    </InfoModalPage>
  );
};

export default CartDetails;
