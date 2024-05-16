import { useIntl } from 'react-intl';
import { InfoDialog } from '@commercetools-frontend/application-components';

import messages from './messages';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { formatMoney } from '../../../helpers';
import { getTotalShippingDiscounts } from './order-prices';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { TBaseMoney, TShipping } from '../../../types/generated/ctp';

interface ShippingCostBreakdownProps {
  isOpen: boolean;
  onClose: (...args: unknown[]) => unknown;
  shippingPricesMulti:
    | {
        gross?: TBaseMoney;
      }
    | undefined
    | null;
  totalShippingDiscountMulti?: TBaseMoney | null;
  shippings?: Array<TShipping>;
}

const ShippingCostBreakdown = ({
  isOpen,
  onClose,
  shippingPricesMulti,
  shippings,
  totalShippingDiscountMulti,
}: ShippingCostBreakdownProps) => {
  const intl = useIntl();

  return (
    <InfoDialog
      isOpen={isOpen}
      onClose={onClose}
      title={intl.formatMessage(messages.modalTitle)}
    >
      <Spacings.Stack scale="m">
        <Spacings.Stack scale="xl">
          <Text.Body intlMessage={messages.modalDescription} />
          <Text.Body intlMessage={messages.shippingCostBreakdownText} />
          <Spacings.Stack scale="m">
            {shippings &&
              shippings.map((shipping, index) => (
                <Spacings.Stack key={shipping.shippingKey} scale="m">
                  <Spacings.Inline justifyContent="space-between">
                    <Text.Detail>
                      {index + 1}. {shipping.shippingInfo?.shippingMethodName}
                    </Text.Detail>

                    {shipping.shippingInfo &&
                      shipping.shippingInfo.taxedPrice?.totalGross && (
                        <Text.Detail>
                          {formatMoney(
                            {
                              ...shipping.shippingInfo.taxedPrice.totalGross,
                              centAmount:
                                shipping.shippingInfo.taxedPrice.totalGross
                                  .centAmount +
                                getTotalShippingDiscounts({
                                  shippingInfo: shipping.shippingInfo,
                                }).centAmount,
                              type: '',
                            },
                            intl
                          )}
                        </Text.Detail>
                      )}
                  </Spacings.Inline>
                </Spacings.Stack>
              ))}
          </Spacings.Stack>
        </Spacings.Stack>
        <Spacings.Inline justifyContent="space-between">
          <Text.Subheadline
            as="h4"
            intlMessage={messages.shippingTotalCost}
            isBold
          />
          {shippingPricesMulti &&
            shippingPricesMulti.gross &&
            totalShippingDiscountMulti && (
              <Text.Subheadline as="h4" isBold>
                {formatMoney(
                  {
                    ...shippingPricesMulti.gross,
                    centAmount:
                      shippingPricesMulti.gross.centAmount +
                      totalShippingDiscountMulti.centAmount,
                  },
                  intl
                )}
              </Text.Subheadline>
            )}
        </Spacings.Inline>
        <ContentNotification
          intlMessage={messages.multiShippingAddressInfo}
          type="info"
        />
      </Spacings.Stack>
    </InfoDialog>
  );
};

export default ShippingCostBreakdown;
