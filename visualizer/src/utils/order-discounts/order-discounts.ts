import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { getFractionedAmount } from '../../helpers';
import {
  TCustomLineItem,
  TDiscountCodeInfo,
  TDiscountedLineItemPortion,
  TDiscountedTotalPricePortion,
  TLineItem,
} from '../../types/generated/ctp';
// Gets the discount code list for every discount. This allow us to group discounts
// codes by discount. Example, for the cart discounts with ids `discount-id-1` and `discount-id-2`:
// { 'discount-id-1': ['CODE1', 'CODE2'], 'discount-id-2': ['CODE3'] }
export const getDiscountsWithDiscountCodes = (
  discountCodes: Array<TDiscountCodeInfo>
) =>
  discountCodes.reduce((orderAcc, { discountCode }) => {
    if (!discountCode) {
      return orderAcc;
    }
    return {
      ...orderAcc,
      ...discountCode.cartDiscounts.reduce(
        (codeAcc, discount) => ({
          ...codeAcc,
          [discount.id]: [...(orderAcc[discount.id] || []), discountCode.code],
        }),
        {}
      ),
    };
  }, {});

export const reduceIncludedDiscounts = ({
  includedDiscounts,
  quantity = 1,
  fractionDigits,
  lineItemDiscounts = {},
}: {
  includedDiscounts: Array<
    TDiscountedLineItemPortion | TDiscountedTotalPricePortion
  >;
  quantity: number;
  fractionDigits: number;
  lineItemDiscounts: any;
}) =>
  includedDiscounts.reduce((acc, { discount, discountedAmount }) => {
    if (!discount) return acc;

    return {
      ...acc,
      [discount.id]: {
        name: discount.obj
          ? discount.obj.name
          : discount.nameAllLocales
          ? transformLocalizedFieldToLocalizedString(discount.nameAllLocales)
          : discount.id,
        amount: {
          ...discountedAmount,
          centAmount: !acc[discount.id]
            ? discountedAmount.centAmount * quantity
            : acc[discount.id].amount.centAmount +
              discountedAmount.centAmount * quantity,
          preciseAmount: !acc[discount.id]
            ? getFractionedAmount(discountedAmount) *
              quantity *
              10 ** fractionDigits
            : acc[discount.id].amount.preciseAmount +
              getFractionedAmount(discountedAmount) *
                quantity *
                10 ** fractionDigits,
        },
      },
    };
  }, lineItemDiscounts);

// This function groups the discounts data in just one object with the total
// discounted and the discount name (discount id in case the obj expansion object does not exist anymore)
export const getDiscountWithDiscountNameAndTotalDiscounted = (
  lineItems: Array<TLineItem | TCustomLineItem>
) => {
  return lineItems.reduce(
    (orderDiscounts, lineItem) => ({
      ...orderDiscounts,
      ...lineItem.discountedPricePerQuantity.reduce(
        (lineItemDiscounts, discPerQty) => ({
          ...lineItemDiscounts,
          ...reduceIncludedDiscounts({
            includedDiscounts: discPerQty.discountedPrice.includedDiscounts,
            quantity: discPerQty.quantity,
            fractionDigits: discPerQty.discountedPrice.value.fractionDigits,
            lineItemDiscounts,
          }),
        }),
        orderDiscounts
      ),
    }),
    {}
  );
};
