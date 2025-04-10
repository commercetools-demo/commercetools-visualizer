import { TCart } from '../../../types/generated/ctp';
import { FC } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import { useOrdersFetcher } from '../../../hooks/use-order-hook';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { getErrorMessage } from '../../../helpers';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { Link } from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

type Props = { cart: TCart };
const CartDetailsGeneralInfoHeader: FC<Props> = ({ cart }) => {
  const intl = useIntl();
  const { projectKey } = useApplicationContext((context) => ({
    projectKey: context.project?.key ?? '',
  }));
  const { orders, loading, error } = useOrdersFetcher({
    offset: 0,
    limit: 10,
    where: `cart(id="${cart.id}")`,
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

  if (!orders || !orders.results) {
    return <PageNotFound />;
  }

  const { results, count } = orders;
  return (
    <Spacings.Inline justifyContent={'space-between'}>
      <Text.Detail tone="secondary">
        <FormattedMessage
          {...messages.dateCreated}
          values={{
            datetime:
              intl.formatDate(cart.createdAt) +
              ' ' +
              intl.formatTime(cart.createdAt),
          }}
        />
      </Text.Detail>
      <Text.Detail tone="secondary">
        <FormattedMessage
          {...messages.dateModified}
          values={{
            datetime:
              intl.formatDate(cart.lastModifiedAt) +
              ' ' +
              intl.formatTime(cart.lastModifiedAt),
          }}
        />
      </Text.Detail>

      {count > 0 && (
        <Link to={`/${projectKey}/orders/${results[0].id}/general`}>
          <FormattedMessage
            {...messages.cartState}
            values={{
              cartState: cart.cartState,
            }}
          />
        </Link>
      )}
      {count === 0 && (
        <Text.Detail tone="secondary">
          <FormattedMessage
            {...messages.cartState}
            values={{
              cartState: cart.cartState,
            }}
          />
        </Text.Detail>
      )}
    </Spacings.Inline>
  );
};

CartDetailsGeneralInfoHeader.displayName = 'OrderDetailsGeneralInfoTabHeader';

export default CartDetailsGeneralInfoHeader;
