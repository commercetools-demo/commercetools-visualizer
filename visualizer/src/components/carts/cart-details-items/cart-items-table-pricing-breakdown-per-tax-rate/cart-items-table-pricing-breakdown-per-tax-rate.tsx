import { useIntl } from 'react-intl';
import { InfoDialog } from '@commercetools-frontend/application-components';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';

import CartItemTableSubtotalPriceCell from '../cart-item-table-subtotal-price-cell';
import CartItemTableTaxRateCell from '../cart-item-table-tax-rate-cell';
import CartItemTableTotalPriceCell from '../cart-item-table-total-price-cell';
import createSelectedColumnsDefinition from './column-definitions';
import messages from './messages';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import {
  filterPerMethodTaxRateByTarget,
  isTaxIncludedInPrice,
} from '../../cart-summary-pricing-breakdown/order-prices';
import CartItemTableUnitPriceCell from '../cart-item-table-unit-price-cell';
import CartItemTableUnitNetPriceCell from '../cart-item-table-unit-net-price-cell';
import DataTable from '@commercetools-uikit/data-table';
import { FC } from 'react';
import {
  TCustomLineItem,
  TDiscountedLineItemPortion,
  TLineItem,
  TShipping,
} from '../../../../types/generated/ctp';
import { isCustomLineItem, isLineItem } from '../../../../helpers';

// We only care about the `discountAmount.centAmount` value as it represents the total discount over a single quantity
const combineIncludedDiscountsAmount = (
  includedDiscounts: Array<TDiscountedLineItemPortion>
) =>
  includedDiscounts.length > 0
    ? includedDiscounts.reduce(
        (acc, current) => acc + (current?.discountedAmount?.centAmount || 0),
        0
      )
    : 0;

interface Props {
  currencySymbol: string;
  isOpen: boolean;
  lineItem: TLineItem | TCustomLineItem;
  onClose?: () => void;
  shipping?: Array<TShipping>;
}

const CartItemsTablePricingBreakdownPerTaxRate: FC<Props> = ({
  lineItem,
  currencySymbol,
  isOpen,
  onClose,
  shipping,
}) => {
  const intl = useIntl();

  const columns = createSelectedColumnsDefinition(
    intl,
    currencySymbol,
    isTaxIncludedInPrice(lineItem)
  );

  // filter only the `perMethodTaxRate` that are used to ship the item
  const filteredPerMethodTaxRate = filterPerMethodTaxRateByTarget(lineItem);

  // each row in this table is the pricing breakdown of an item according to the tax rate.
  // each tax rate is applied to different addresses
  // This table is shown only in the case where an item is shipped to multiple addresses with different taxe rates
  // if the tax rate is the same the this table hidden and the usual numbers are shown in order-items-panel component
  const rows = filteredPerMethodTaxRate.map((perMethodTaxRate) => {
    const shippingTarget = lineItem.shippingDetails?.targets.find(
      (target) =>
        target.shippingMethodKey === perMethodTaxRate.shippingMethodKey
    ) || { quantity: 1 };

    // for line items taxedPricePortion is calculated on the backend
    const lineItemTaxedPricePortion =
      isLineItem(lineItem) &&
      lineItem.taxedPricePortions.find(
        (taxedPricePortion) =>
          taxedPricePortion.shippingMethodKey ===
          perMethodTaxRate.shippingMethodKey
      )?.taxedPrice;

    // for custom line items, taxedPricePortion was recently on 08.08.2023 added but for old orders,
    // we need to calculate it on the frontend
    const customLineItemTaxedPricePortion =
      isCustomLineItem(lineItem) &&
      (lineItem.taxedPricePortions.length > 0
        ? lineItem.taxedPricePortions.find(
            (taxedPricePortion) =>
              taxedPricePortion.shippingMethodKey ===
              perMethodTaxRate.shippingMethodKey
          )?.taxedPrice
        : {
            ...lineItem.taxedPrice,
            totalGross: {
              ...lineItem.taxedPrice?.totalGross,
              centAmount: perMethodTaxRate.taxRate?.includedInPrice
                ? lineItem.money.centAmount * shippingTarget?.quantity
                : lineItem.money.centAmount *
                  shippingTarget.quantity *
                  (1 + (perMethodTaxRate.taxRate?.amount || 0)),
            },
            totalNet: {
              ...lineItem.taxedPrice?.totalNet,
              centAmount: perMethodTaxRate.taxRate?.includedInPrice
                ? (lineItem.money.centAmount * shippingTarget.quantity) /
                  (1 + perMethodTaxRate.taxRate.amount)
                : lineItem.money.centAmount * shippingTarget.quantity,
            },
          });

    const shippingAddress = shipping?.find(
      (shipping) => shipping.shippingKey === perMethodTaxRate.shippingMethodKey
    )?.shippingAddress;

    return {
      ...lineItem,
      discountedPricePerQuantity:
        lineItem.discountedPricePerQuantity.length > 0
          ? lineItem.discountedPricePerQuantity.map(
              (discountedPricePerQty) => ({
                quantity: shippingTarget.quantity,
                discountedPrice: {
                  ...discountedPricePerQty.discountedPrice,
                  value: {
                    ...discountedPricePerQty.discountedPrice.value,
                    centAmount:
                      combineIncludedDiscountsAmount(
                        discountedPricePerQty.discountedPrice.includedDiscounts
                      ) * shippingTarget.quantity,
                  },
                },
              })
            )
          : [],
      id: `${lineItem}-${perMethodTaxRate.taxRate?.id || ''}`,
      taxedPrice: isCustomLineItem(lineItem)
        ? customLineItemTaxedPricePortion
        : lineItemTaxedPricePortion,
      // by setting perMethodTaxRate to empty array and setting the tax rate to perMethodTaxRate.taxRate
      // we try to emulate the case of single shipping mode with a single tax rate
      perMethodTaxRate: [],
      taxRate: perMethodTaxRate.taxRate,
      quantity: shippingTarget.quantity,
      shippingAddress,
    };
  });

  const renderItem = (lineItem: any, column: any) => {
    const { key: columnKey } = column;

    switch (columnKey) {
      case 'country':
        return lineItem.shippingAddress?.country || NO_VALUE_FALLBACK;
      case 'state':
        return lineItem.shippingAddress?.state || NO_VALUE_FALLBACK;
      case 'price':
        // unit price, only visible when tax is NOT included in price
        return <CartItemTableUnitPriceCell lineItem={lineItem} />;
      case 'netPrice':
        // unit price, only visible when tax is included in price
        return <CartItemTableUnitNetPriceCell lineItem={lineItem} />;
      case 'quantity':
        return lineItem.quantity;
      case 'taxRate':
        return (
          <CartItemTableTaxRateCell
            lineItem={lineItem}
            currencySymbol={currencySymbol}
          />
        );
      case 'subtotalPrice':
        return <CartItemTableSubtotalPriceCell lineItem={lineItem} />;
      case 'totalPrice':
        return <CartItemTableTotalPriceCell lineItem={lineItem} />;
      default:
        return null;
    }
  };

  return (
    <InfoDialog
      isOpen={isOpen}
      onClose={onClose}
      size="scale"
      title={intl.formatMessage(messages.modalTitle)}
    >
      <Spacings.Stack scale="m">
        <Text.Body intlMessage={messages.modalDescription} />
        <DataTable columns={columns} itemRenderer={renderItem} rows={rows} />
      </Spacings.Stack>
    </InfoDialog>
  );
};

export default CartItemsTablePricingBreakdownPerTaxRate;
