import { createSelector } from 'reselect';
import {
  getDiscountWithDiscountNameAndTotalDiscounted,
  getDiscountsWithDiscountCodes,
  reduceIncludedDiscounts,
} from '../order-discounts';
import { TCart } from '../../types/generated/ctp';
import { notEmpty } from '../../helpers';
import { Discount } from '../../components/carts/cart-applied-discounts-panel/cart-applied-discounts-panel';

export const selectCartDraft = (cartDraft: TCart) => cartDraft;

export const selectAllLineItems = (cartDraft: TCart) => [
  ...cartDraft.lineItems,
  ...cartDraft.customLineItems,
];
export const selectTotalGrossPrice = (cartDraft: TCart) =>
  cartDraft.taxedPrice ? cartDraft.taxedPrice.totalGross : cartDraft.totalPrice;

export const selectDiscountCodes = (cartDraft: TCart) =>
  cartDraft.discountCodes
    .map(({ discountCode }) => {
      if (!discountCode) {
        return undefined;
      }
      return {
        id: discountCode.id,
        name: discountCode.id,
        code: discountCode.id,
      };
    })
    .filter(notEmpty);

export const selectShippingDiscountedPrice = (cartDraft: TCart) =>
  cartDraft.shippingInfo ? cartDraft.shippingInfo.discountedPrice : undefined;

export const selectShippingPrice = (cartDraft: TCart) =>
  !cartDraft.shippingInfo
    ? undefined
    : cartDraft.shippingInfo.taxedPrice
    ? cartDraft.shippingInfo.taxedPrice.totalGross
    : cartDraft.shippingInfo.price;

export const selectDiscountsWithDiscountCodes = (cartDraft: TCart) =>
  getDiscountsWithDiscountCodes(cartDraft.discountCodes);

export const selectDiscounts = createSelector(
  selectAllLineItems,
  selectDiscountsWithDiscountCodes,
  (lineItems, discountsWithDiscountCodes): Array<Discount> =>
    Object.entries(getDiscountWithDiscountNameAndTotalDiscounted(lineItems))
      .map(([discountId, discount]) => {
        if (!discount) {
          return undefined;
        }
        return {
          id: discountId,
          name: discount.name,
          amount: discount.amount,
          discountCodes: discountsWithDiscountCodes[discountId] || [],
        };
      })
      .filter(notEmpty)
);

export const selectShippingDiscounts = createSelector(
  selectDiscountsWithDiscountCodes,
  selectShippingDiscountedPrice,
  (discountsWithDiscountCodes, shippingDiscountedPrice): Array<Discount> => {
    const shippingDiscounts = shippingDiscountedPrice
      ? reduceIncludedDiscounts({
          ...shippingDiscountedPrice,
          fractionDigits: shippingDiscountedPrice.value.fractionDigits,
        })
      : {};
    return Object.entries(shippingDiscounts).map(([key, value]) => ({
      id: key,
      name: value.name,
      amount: value.amount,
      discountCodes: discountsWithDiscountCodes[key] || [],
    }));
  }
);

export const selectDiscountsOnTotalPrice = (
  cartDraft: TCart
): Array<Discount> => {
  if (!cartDraft?.discountOnTotalPrice?.includedDiscounts) return [];

  const discountsWithDiscountCodes =
    selectDiscountsWithDiscountCodes(cartDraft);

  const discountsOnTotalPrice = reduceIncludedDiscounts({
    includedDiscounts: cartDraft.discountOnTotalPrice.includedDiscounts,
    fractionDigits:
      cartDraft.discountOnTotalPrice.discountedAmount.fractionDigits,
  });

  return Object.entries(discountsOnTotalPrice).map(
    ([key, value]): Discount => ({
      id: key,
      name: value.name,
      amount: value.amount,
      discountCodes: discountsWithDiscountCodes[key] || [],
    })
  );
};
