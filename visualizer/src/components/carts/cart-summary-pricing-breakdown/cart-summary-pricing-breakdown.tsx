import { css } from '@emotion/react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useModalState } from '@commercetools-frontend/application-components';
import { TCart, TTaxPortion } from '../../../types/generated/ctp';
import { FC } from 'react';
import { SHIPPING_MODES } from '../addresses-panel/addresses-panel';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import {
  convertRatioToPercentage,
  formatMoney,
  formatPercentage,
} from '../../../helpers';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import messages from './messages';
import {
  determineIfTaxIncludedInPrice,
  getAllNonShippingMultiTaxes,
  getAllNonShippingTaxes,
  getCartDiscountOnTotalPrice,
  getGrossPriceWithoutShipping,
  getGrossPriceWithoutShippingMulti,
  getMultiShippings,
  getNetTotalDiscount,
  getOrderSubtotalAfterDiscount,
  getShippingPrices,
  getShippingPricesMulti,
  getTotalDiscount,
  getTotalShippingDiscounts,
  getTotalShippingDiscountsMulti,
  subtotalWithoutDiscounts as subtotalWithoutDiscountsF,
  subtotalWithoutDiscountsMutli,
} from './order-prices';
import ShippingCostBreakdown from './shipping-cost-breakdown';

type Props = { cart: TCart };

const CartSummaryPricingBreakdown: FC<Props> = ({ cart }) => {
  const intl = useIntl();
  const { openModal, isModalOpen, closeModal } = useModalState();

  const isTaxRateIncludedInPrice = determineIfTaxIncludedInPrice(cart);

  const totalDiscount = getTotalDiscount(cart);

  const hasTaxInfo = Boolean(cart.taxedPrice);

  const hasOrderDiscounts = Boolean(totalDiscount);

  const isSingleShippingMode = cart.shippingMode === SHIPPING_MODES.SINGLE;
  const isMultiShippingMode = cart.shippingMode === SHIPPING_MODES.MULTIPLE;

  // check if shipping method is using "Single" mode
  const hasSingleShippingInfo =
    isSingleShippingMode && Boolean(cart.shippingInfo);

  // check if shipping method is using "Multiple" mode
  const hasMultiShippingInfo = isMultiShippingMode && cart.shipping.length > 0;

  // check if no shipping method is attached to this order (should be treated as single mode)
  const hasNoShipping = !hasMultiShippingInfo && !hasSingleShippingInfo;

  // ----------- When ShippingMode is Single --------------
  const taxPortions =
    hasTaxInfo &&
    (hasSingleShippingInfo || (isSingleShippingMode && hasNoShipping))
      ? getAllNonShippingTaxes(cart)
      : [];

  // calculate shipping prices
  const shippingPrices = hasSingleShippingInfo ? getShippingPrices(cart) : null;

  // calculate total discounts based on all included discounts
  const totalShippingDiscount = hasSingleShippingInfo
    ? getTotalShippingDiscounts(cart)
    : null;

  // calculate order total without discounts and without shipping
  const subtotalWithoutDiscounts =
    hasSingleShippingInfo || (isSingleShippingMode && hasNoShipping)
      ? subtotalWithoutDiscountsF(cart)
      : null;

  const netTotalDiscount =
    (hasSingleShippingInfo || (isSingleShippingMode && hasNoShipping)) &&
    subtotalWithoutDiscounts
      ? getNetTotalDiscount(subtotalWithoutDiscounts, cart)
      : null;

  const orderSubtotalAfterDiscount =
    (hasSingleShippingInfo || (isSingleShippingMode && hasNoShipping)) &&
    subtotalWithoutDiscounts
      ? getOrderSubtotalAfterDiscount(
          subtotalWithoutDiscounts,
          netTotalDiscount
        )
      : null;

  // ----------- When ShippingMode is Multiple --------------
  const taxPortionsMulti =
    hasTaxInfo &&
    (hasMultiShippingInfo || (isMultiShippingMode && hasNoShipping))
      ? getAllNonShippingMultiTaxes(cart)
      : [];

  // calculate all shipping prices
  const shippingPricesMulti = hasMultiShippingInfo
    ? getShippingPricesMulti(cart)
    : null;

  // calculate total discounts based on all included discounts
  const totalShippingDiscountMulti = hasMultiShippingInfo
    ? getTotalShippingDiscountsMulti(cart)
    : null;

  // calculate order total without discounts and without shipping
  const subtotalWithoutDiscountsMulti =
    hasMultiShippingInfo || (isMultiShippingMode && hasNoShipping)
      ? subtotalWithoutDiscountsMutli(cart)
      : null;

  const netTotalDiscountMulti =
    (hasMultiShippingInfo || (isMultiShippingMode && hasNoShipping)) &&
    subtotalWithoutDiscountsMulti
      ? getNetTotalDiscount(subtotalWithoutDiscountsMulti, cart)
      : null;

  const orderSubtotalAfterDiscountMulti =
    (hasMultiShippingInfo || (isMultiShippingMode && hasNoShipping)) &&
    subtotalWithoutDiscountsMulti
      ? getOrderSubtotalAfterDiscount(
          subtotalWithoutDiscountsMulti,
          netTotalDiscountMulti
        )
      : null;

  const shippings = getMultiShippings(cart);

  // calculate cart discount with target: cartTotal
  const cartDiscountOnTotalPrice = getCartDiscountOnTotalPrice(cart);

  return (
    <Spacings.Stack scale="m">
      <Spacings.Stack scale="m">
        <Spacings.Stack scale="xs">
          <Spacings.Inline justifyContent="space-between" scale="m">
            <Text.Detail intlMessage={messages.subtotal} />
            <Text.Detail>
              {formatMoney(
                isMultiShippingMode
                  ? subtotalWithoutDiscountsMulti
                  : subtotalWithoutDiscounts,
                intl
              )}
            </Text.Detail>
          </Spacings.Inline>

          {hasOrderDiscounts && (
            <Spacings.Inline justifyContent="space-between" scale="m">
              <FormattedMessage {...messages.netTotalDiscount} />
              <Text.Detail tone="secondary" />
              <Spacings.Inline justifyContent="flex-end">
                <Text.Detail tone="secondary">
                  {`- ${formatMoney(
                    isMultiShippingMode
                      ? netTotalDiscountMulti
                      : netTotalDiscount,
                    intl
                  )}`}
                </Text.Detail>
              </Spacings.Inline>
            </Spacings.Inline>
          )}

          {hasOrderDiscounts && isTaxRateIncludedInPrice && totalDiscount && (
            <Spacings.Inline justifyContent="flex-end" scale="m">
              <Text.Detail
                intlMessage={{
                  ...messages.grossTotalDiscount,
                  values: {
                    amount: formatMoney({ ...totalDiscount, type: '' }, intl),
                  },
                }}
                tone="secondary"
              />
            </Spacings.Inline>
          )}

          {hasOrderDiscounts && (
            <div
              css={css`
                padding: 4px;
                background-color: var(--color-accent-98);
                margin-left: -4px !important;
                margin-right: -4px !important;
              `}
            >
              <Spacings.Inline justifyContent="space-between" scale="m">
                <Text.Detail
                  intlMessage={messages.totalAmountDiscounted}
                  isBold
                />
                <Text.Detail isBold={true}>
                  {formatMoney(
                    isMultiShippingMode
                      ? orderSubtotalAfterDiscountMulti
                      : orderSubtotalAfterDiscount,
                    intl
                  )}
                </Text.Detail>
              </Spacings.Inline>
            </div>
          )}
        </Spacings.Stack>

        <Spacings.Stack scale="xs">
          {isSingleShippingMode &&
            taxPortions.length > 0 &&
            taxPortions.map((portion: TTaxPortion, index: number) => (
              <Spacings.Inline
                key={index}
                justifyContent="space-between"
                scale="m"
              >
                <Text.Detail>
                  <FormattedMessage {...messages.taxKey} />{' '}
                  {`${formatPercentage(
                    convertRatioToPercentage(portion.rate)
                  )} ${portion.name || ''}`}
                </Text.Detail>
                <Text.Detail>
                  {`+ ${formatMoney(portion.amount, intl)}`}
                </Text.Detail>
              </Spacings.Inline>
            ))}

          {isMultiShippingMode &&
            taxPortionsMulti.length > 0 &&
            taxPortionsMulti &&
            taxPortionsMulti.map((portion: TTaxPortion, index: number) => (
              <Spacings.Inline
                key={index}
                justifyContent="space-between"
                scale="m"
              >
                <Text.Detail>
                  <FormattedMessage {...messages.taxKey} />{' '}
                  {`${formatPercentage(
                    convertRatioToPercentage(portion.rate)
                  )} ${portion.name || ''}`}
                </Text.Detail>
                <Text.Detail>
                  {`+ ${formatMoney(portion.amount, intl)}`}
                </Text.Detail>
              </Spacings.Inline>
            ))}

          {
            // Show gross subtotal if taxed and tax portions available
            hasTaxInfo &&
              isSingleShippingMode &&
              taxPortions &&
              taxPortions.length > 0 && (
                <div
                  css={css`
                    padding: 4px;
                    background-color: var(--color-accent-98);
                    margin-left: -4px !important;
                    margin-right: -4px !important;
                  `}
                >
                  <Spacings.Inline justifyContent="space-between" scale="m">
                    <Text.Detail intlMessage={messages.grossSubtotal} isBold />

                    <Text.Detail isBold>
                      {formatMoney(getGrossPriceWithoutShipping(cart), intl)}
                    </Text.Detail>
                  </Spacings.Inline>
                </div>
              )
          }
          {
            // Show gross subtotal if taxed and tax portions available when mode is multi
            hasTaxInfo &&
              isMultiShippingMode &&
              taxPortionsMulti &&
              taxPortionsMulti.length > 0 && (
                <div
                  css={css`
                    padding: 4px;
                    background-color: var(--color-accent-98);
                    margin-left: -4px !important;
                    margin-right: -4px !important;
                  `}
                >
                  <Spacings.Inline justifyContent="space-between" scale="m">
                    <Text.Detail intlMessage={messages.grossSubtotal} isBold />

                    <Text.Detail isBold>
                      {formatMoney(
                        getGrossPriceWithoutShippingMulti(cart),
                        intl
                      )}
                    </Text.Detail>
                  </Spacings.Inline>
                </div>
              )
          }
        </Spacings.Stack>

        <Spacings.Stack scale="xs">
          {hasSingleShippingInfo && (
            <Spacings.Inline justifyContent="space-between" scale="m">
              <Text.Detail>
                <FormattedMessage {...messages.shippingPrice} />
                {`: ${cart.shippingInfo?.shippingMethodName}`}
              </Text.Detail>

              {shippingPrices?.gross && totalShippingDiscount && (
                <Text.Detail>
                  {`+ ${formatMoney(
                    {
                      ...shippingPrices?.gross,
                      centAmount:
                        shippingPrices?.gross.centAmount +
                        totalShippingDiscount.centAmount,
                    },
                    intl
                  )}`}
                </Text.Detail>
              )}
            </Spacings.Inline>
          )}

          {hasMultiShippingInfo && (
            <Spacings.Inline justifyContent="space-between" scale="m">
              <Spacings.Inline alignItems="center" scale="xs">
                <Text.Detail intlMessage={messages.shippingPrice} />
                <SecondaryButton
                  //      icon={<InfoIcon color="info" />}
                  label="Cost breakdown by shipping"
                  onClick={openModal}
                  size="medium"
                />
                <ShippingCostBreakdown
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  shippingPricesMulti={shippingPricesMulti}
                  shippings={shippings}
                  totalShippingDiscountMulti={totalShippingDiscountMulti}
                />
              </Spacings.Inline>

              {shippingPricesMulti &&
                totalShippingDiscountMulti &&
                shippingPricesMulti.gross && (
                  <Text.Detail>
                    {`+ ${formatMoney(
                      {
                        ...shippingPricesMulti.gross,
                        centAmount:
                          shippingPricesMulti.gross.centAmount +
                          totalShippingDiscountMulti.centAmount,
                      },
                      intl
                    )}`}
                  </Text.Detail>
                )}
            </Spacings.Inline>
          )}

          {hasSingleShippingInfo &&
            totalShippingDiscount?.centAmount !== undefined && (
              <Spacings.Inline justifyContent="space-between" scale="m">
                <Text.Detail
                  intlMessage={messages.shippingDiscount}
                  tone="secondary"
                />
                <Text.Detail tone="secondary">
                  {`- ${formatMoney(totalShippingDiscount, intl)}`}
                </Text.Detail>
              </Spacings.Inline>
            )}

          {isMultiShippingMode &&
            totalShippingDiscountMulti?.centAmount !== undefined && (
              <Spacings.Inline justifyContent="space-between" scale="m">
                <Text.Detail tone="secondary">
                  <FormattedMessage {...messages.shippingDiscount} />
                </Text.Detail>
                <Text.Detail tone="secondary">
                  {`- ${formatMoney(totalShippingDiscountMulti, intl)}`}
                </Text.Detail>
              </Spacings.Inline>
            )}
        </Spacings.Stack>

        {cartDiscountOnTotalPrice && (
          <Spacings.Stack scale="xs">
            <Spacings.Inline justifyContent="space-between" scale="m">
              <Text.Detail
                intlMessage={messages.discountOnOrderTotal}
                tone="secondary"
              />
              <Text.Detail tone="secondary">
                {`- ${formatMoney(cartDiscountOnTotalPrice, intl)}`}
              </Text.Detail>
            </Spacings.Inline>
          </Spacings.Stack>
        )}
      </Spacings.Stack>
      <Spacings.Inline justifyContent="space-between" scale="m">
        <Text.Subheadline as="h4">
          <b>{intl.formatMessage(messages.totalPrice)}</b>{' '}
          {cart.taxedPrice && <FormattedMessage {...messages.totalGross} />}
        </Text.Subheadline>
        <Text.Subheadline as="h4" isBold>
          {formatMoney(
            cart.taxedPrice ? cart.taxedPrice.totalGross : cart.totalPrice,
            intl
          )}
        </Text.Subheadline>
      </Spacings.Inline>
    </Spacings.Stack>
  );
};

export default CartSummaryPricingBreakdown;
