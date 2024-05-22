import isEqual from 'lodash/isEqual';
import { SHIPPING_MODES } from '../addresses-panel/addresses-panel';
import { getFractionedAmount, notEmpty } from '../../../helpers';
import { PRECISION_TYPES } from '../../../constants';
import {
  TBaseMoney,
  TCart,
  TCustomLineItem,
  TDiscountedLineItemPortion,
  TDiscountedLineItemPriceForQuantity,
  THighPrecisionMoney,
  TLineItem,
  TMoney,
  TProductPrice,
  TShipping,
  TTaxPortion,
  TTaxRate,
} from '../../../types/generated/ctp';

export type NetAndGross = {
  net: TBaseMoney | undefined;
  gross: TBaseMoney | undefined;
};

/*
---------------------------------------------------------------
Helpful Functions
---------------------------------------------------------------
*/
export const filterPerMethodTaxRateByTarget = (
  lineItem: TLineItem | TCustomLineItem
) =>
  lineItem.perMethodTaxRate?.filter((perMethodTax) => {
    let findIndex = lineItem.shippingDetails?.targets?.findIndex((target) => {
      return target.shippingMethodKey === perMethodTax.shippingMethodKey;
    });
    return findIndex && findIndex >= 0;
  });
export const isTaxIncludedInPrice = (lineItem: TLineItem | TCustomLineItem) => {
  const filteredPerMethodTaxRates = filterPerMethodTaxRateByTarget(lineItem);

  // If order is multi shipping mode
  if (filteredPerMethodTaxRates?.length > 0) {
    return filteredPerMethodTaxRates.some(
      (perMethodTax) =>
        perMethodTax.taxRate && perMethodTax.taxRate.includedInPrice
    );
  }

  // if order is in single shipping mode
  return lineItem.taxRate && lineItem.taxRate.includedInPrice;
};

export const determineIfTaxIncludedInPrice = (order: TCart) => {
  const items = [...order.lineItems, ...order.customLineItems];
  // If at least one of the perMethodTaxRate of one line item is includedInPrice
  if (order.shippingMode === SHIPPING_MODES.MULTIPLE) {
    return items.some(
      (lineItem) =>
        lineItem?.perMethodTaxRate &&
        lineItem.perMethodTaxRate.some(
          (perMethodTax) => perMethodTax?.taxRate?.includedInPrice
        )
    );
  }

  return items.some(
    (lineItem) => lineItem.taxRate && lineItem.taxRate.includedInPrice
  );
};

export const isTaxRateSameInMultiMode = (
  lineItem: TLineItem | TCustomLineItem
) => {
  if (lineItem?.perMethodTaxRate?.length < 2) return true;

  const filteredPerMethodTaxRates = filterPerMethodTaxRateByTarget(lineItem);

  if (filteredPerMethodTaxRates?.length < 2) return true;

  return filteredPerMethodTaxRates?.every((item) =>
    isEqual(filteredPerMethodTaxRates[0]?.taxRate, item?.taxRate)
  );
};

// check whether an item in the order has multiple different tax rates in multi shipping mode
export const determinteIfTaxRateSameInMultiMode = (order: TCart) => {
  // if mode is single, we don't care about it so return true
  if (order.shippingMode === SHIPPING_MODES.SINGLE) return true;

  const items = [...order.lineItems, ...order.customLineItems];

  return items.every(isTaxRateSameInMultiMode);
};

export function getShippingDiscounts(order: Pick<TCart, 'shippingInfo'>) {
  const { shippingInfo } = order;

  // no shipping or no shipping discounts
  if (!shippingInfo || !shippingInfo.discountedPrice) return null;

  return shippingInfo.discountedPrice.includedDiscounts;
}

export const getMultiShippings = (order: TCart) => {
  const hasMultiShippingInfo =
    order.shippingMode === SHIPPING_MODES.MULTIPLE && order.shipping.length > 0;

  const shippingKeys = [...order.lineItems, ...order.customLineItems]
    .flatMap((item) =>
      item?.shippingDetails?.targets?.flatMap(
        (target) => target?.shippingMethodKey
      )
    )
    .filter(notEmpty);

  return hasMultiShippingInfo
    ? order.shipping.filter((shipping) => {
        if (!shipping.shippingKey) {
          return false;
        }
        return shippingKeys.includes(shipping.shippingKey);
      })
    : [];
};

function getShippingDiscountsMulti(order: TCart) {
  const shippings = getMultiShippings(order);

  return shippings
    .flatMap(
      (shipping) => shipping?.shippingInfo?.discountedPrice?.includedDiscounts
    )
    .filter(notEmpty);
}

export function getCartDiscountOnTotalPrice(order: TCart) {
  return order?.discountOnTotalPrice?.discountedGrossAmount;
}

export function getNetCartDiscountOnTotalPrice(order: TCart) {
  return order?.discountOnTotalPrice?.discountedNetAmount;
}

const getProductDiscountForLineItem = (lineItem: TLineItem) => {
  if (lineItem.price?.discounted) {
    const regularPrice = getFractionedAmount(lineItem.price.value);
    const discountedPrice = getFractionedAmount(
      lineItem.price.discounted.value
    );
    return (
      (regularPrice - discountedPrice) *
      lineItem.quantity *
      10 ** (lineItem.totalPrice?.fractionDigits || 2)
    );
  }

  return 0;
};

export function getTotalProductDiscount(lineItems: Array<TLineItem>) {
  return lineItems.reduce(
    (total, lineItem) => total + getProductDiscountForLineItem(lineItem),
    0
  );
}

const getTotalAmountForDiscountedLineItem = (
  includedDiscounts: Array<TDiscountedLineItemPortion>
) =>
  includedDiscounts.reduce(
    (acc, discount) => acc + getFractionedAmount(discount.discountedAmount),
    0
  );

const getTotalPriceForDiscountedLineItem = (
  discountedPerQuantity: Array<TDiscountedLineItemPriceForQuantity>
) =>
  discountedPerQuantity.reduce(
    (total, discounted) =>
      total +
      getTotalAmountForDiscountedLineItem(
        discounted.discountedPrice.includedDiscounts
      ) *
        discounted.quantity,
    0
  );

const getCartDiscountForLineItem = (lineItem: TLineItem | TCustomLineItem) =>
  getTotalPriceForDiscountedLineItem(lineItem.discountedPricePerQuantity) *
  10 ** (lineItem.totalPrice?.fractionDigits || 2);

export function getTotalCartDiscount(
  lineItems: Array<TLineItem | TCustomLineItem>
) {
  return lineItems.reduce(
    (acc, lineItem) => acc + getCartDiscountForLineItem(lineItem),
    0
  );
}

type TaxRateAndQuantity = {
  quantity: number;
  taxRate: TTaxRate | undefined | null;
};

const findTaxRatesAndQuantitiesForItem = (
  item: TLineItem | TCustomLineItem
): Array<TaxRateAndQuantity> => {
  if (!item.shippingDetails || item.shippingDetails.targets.length === 0)
    return [];

  return item.shippingDetails.targets
    .map((target) => {
      const perMethodTaxRate = item.perMethodTaxRate.find(
        (perMethodTaxRateItem) =>
          perMethodTaxRateItem.shippingMethodKey === target.shippingMethodKey
      );

      if (perMethodTaxRate) {
        return {
          quantity: target.quantity,
          taxRate: perMethodTaxRate.taxRate,
        };
      }

      return null;
    })
    .filter(notEmpty);
};

function mapTaxRatesAndQuantitiesToItems(
  item: TLineItem | TCustomLineItem,
  taxRatesAndQuantities: Array<TaxRateAndQuantity>
): Array<
  | (TaxRateAndQuantity & { money: TBaseMoney })
  | (TaxRateAndQuantity & { price: TProductPrice })
> {
  if ('money' in item) {
    // if the current items doesn't have any shipping targets (thus no tax rates) then we return just the price, quantity and an empty taxRate object
    // this case is for digitial items for exmaple that doesn't require shipping
    // we still need to return it as an array so it can be flap mapped into the main function
    if (taxRatesAndQuantities.length === 0) {
      return [
        {
          money: item.money,
          quantity: item.quantity,
          taxRate: null,
        },
      ];
    }

    return taxRatesAndQuantities.map((taxRateAndQuantity) => ({
      money: item.money,
      ...taxRateAndQuantity,
    }));
  } else {
    // if the current items doesn't have any shipping targets (thus no tax rates) then we return just the price, quantity and an empty taxRate object
    // this case is for digitial items for exmaple that doesn't require shipping
    // we still need to return it as an array so it can be flap mapped into the main function
    if (taxRatesAndQuantities.length === 0) {
      return [
        {
          price: item.price,
          quantity: item.quantity,
          taxRate: null,
        },
      ];
    }

    return taxRatesAndQuantities.map((taxRateAndQuantity) => ({
      price: item.price,
      ...taxRateAndQuantity,
    }));
  }
}

/*
This function transforms order items using multiple shipping methods to a similair object structure as when items are in single mode
This is just a helpful function to transform the items so they can be passed to `subtotalWithoutDiscounts` to calculate the subtotal

Each item in multiple shipping mode can be transformed into several items (each item (object) has its own shipping method and its own tax rate)

Input: ----------
[
  {
    price: {},
    perMethodTaxRate: [],
    shippingDetails: {targets: []}
    quantity: number
  }
]

output: ----------
[
  {
    price: {},
    taxRate: {}
    quantity: number
  },
  {
    price: {},
    taxRate: {}
    quantity: number
  }
]
*/
function transformItemsFromMultiToSingle(
  allItems: Array<TLineItem | TCustomLineItem>
) {
  if (allItems.length === 0) {
    return [];
  }

  // map over each item and for each item
  // map over shipping targets and for each target
  // find the associated perMethodTaxRate by checking shippingMethodKey
  // and extract the quantity and the tax rate for that shipping target

  // for each item we will have an array of objects representing that item with several tax rates coming from the different shipping targets
  // so we flat map those objects to get an array represeting all the items with all their different tax rates
  return allItems.flatMap((item) => {
    const taxRatesAndQuantities = findTaxRatesAndQuantitiesForItem(item);

    // to avoid mapping the whole line item or custom line item object (since it's quite large in the case of multiple shipping methods)
    // so map only `money` in case of custom line item or `price` in case of line item, and of course the tax rate and associated quantity
    return mapTaxRatesAndQuantitiesToItems(item, taxRatesAndQuantities);
  });
}

function calculateSubtotalCentAmount(
  allItems: Array<
    | {
        money: TBaseMoney;
        quantity: number;
        taxRate?: TTaxRate | null;
      }
    | {
        price: { value: TBaseMoney };
        quantity: number;
        taxRate?: TTaxRate | null;
      }
  >,
  orderFractionDigits: number
) {
  return allItems.reduce((acc, item) => {
    // if item is a custom line item then `money` is defined, otherwise `price` is defined
    const itemPrice: TBaseMoney =
      'money' in item ? item?.money : item.price.value;

    let totalCentAmount;
    // should accept 0 value
    if (typeof itemPrice?.centAmount === 'number') {
      totalCentAmount = itemPrice.centAmount * item.quantity;
    }

    let totalPreciseAmount;
    if (itemPrice?.type === PRECISION_TYPES.highPrecision) {
      // use the precise amount to get the total price for the item, this helps to get accurate numbers when the precise is low compared to the fraction digits
      // Example preciseAmount: 12 and fractionDigits: 6 and quantity 200
      const totalItemPreciseAmount =
        (itemPrice as THighPrecisionMoney).preciseAmount * item.quantity;

      // Convert the precise amount to its unit price representation. This is achieved by "unscaling" the
      // preciseAmount based on its fraction digits. For example, if preciseAmount represents a value with 4 fraction
      // digits (e.g., 12345 for 1.2345), dividing by 10^fractionDigits converts it to its actual numeric value.
      const totalPreciseAmountScaledToUnitPrice =
        totalItemPreciseAmount / Math.pow(10, itemPrice.fractionDigits);

      // Now, convert the unit price to the total price representation that aligns with the desired number of
      // fraction digits for the order total.
      const totalPreciseAmountScaledToOrderTotalPrice = Math.round(
        totalPreciseAmountScaledToUnitPrice * Math.pow(10, orderFractionDigits)
      );

      totalPreciseAmount = totalPreciseAmountScaledToOrderTotalPrice;
    }

    // This amount is the total amount of the item (price * quantity) corrected to match the fraction digits of the order total price
    // totalPreciseAmount can be 0 and that should be treated as a valid value hence `??`
    const totalItemAmount = (totalPreciseAmount ?? totalCentAmount) || 0;

    if (item.taxRate?.includedInPrice) {
      const amount = totalItemAmount / (1 + item.taxRate.amount);

      return acc + amount;
    }

    return acc + totalItemAmount;
  }, 0);
}

function combineShippingTaxPortions(taxPortions: Array<TaxPortion>) {
  const combined: Array<TaxPortion> = [];

  taxPortions.forEach((portion) => {
    // Check if this name and amount already exists in the combined array
    const existingIndex = combined.findIndex(
      (item) => item.name === portion.name && item.amount === portion.amount
    );

    if (existingIndex > -1) {
      // If it exists, add the taxAmount
      combined[existingIndex].taxAmount += portion.taxAmount;
    } else {
      // If it doesn't exist, push this portion into the combined array
      combined.push({ ...portion });
    }
  });

  return combined;
}

function getMultiShippingTaxPortions(shipping: Array<TShipping>) {
  const taxPortions = shipping
    .flatMap((sh) => {
      // if a shipping method has no tax rate, then ignore it
      if (!sh?.shippingInfo?.taxRate) return null;

      const shippingPrice = getShippingPrices({
        shippingInfo: sh.shippingInfo,
      });

      const shippingTaxAmount =
        (shippingPrice?.gross?.centAmount || 0) -
        (shippingPrice?.net?.centAmount || 0);

      // calculate tax portions from tax rate (if tax rate has subrates then include those as tax portions, if not then include tax rate as tax portion)
      return getShippingTaxPortionsFromTaxRate(
        sh.shippingInfo.taxRate,
        shippingTaxAmount
      );
    })
    .filter(notEmpty);

  return combineShippingTaxPortions(taxPortions);
}

type TaxPortion = { name: string; taxAmount: number; amount: number };

function getShippingTaxPortionsFromTaxRate(
  taxRate: TTaxRate | undefined | null,
  shippingTaxAmount: number
): Array<TaxPortion> {
  // if there are not subrates, then return just the tax rate as an array
  // so this function can always return array for easier processing
  if (taxRate && taxRate.subRates.length === 0) {
    return [{ ...taxRate, taxAmount: shippingTaxAmount }];
  }

  return (
    taxRate?.subRates.map((subrate) => ({
      ...subrate,
      taxAmount: Math.round(
        (shippingTaxAmount * subrate.amount) / taxRate.amount
      ),
    })) || []
  );
}

function extractLineItemTaxPortions(
  taxPortions: Array<TTaxPortion>,
  shippingTaxPortions: Array<TaxPortion>
) {
  return taxPortions.map((taxPortion) => {
    // find the tax rate from shipping matching the tax portion
    const foundShippingTaxPortion = shippingTaxPortions.find(
      (shippingTaxPortion) =>
        shippingTaxPortion.name === taxPortion.name &&
        shippingTaxPortion.amount === taxPortion.rate
    );

    // if the current tax portion is independent from the shipping tax portions, then return as is
    if (!foundShippingTaxPortion) return taxPortion;

    // if the current tax portion is also used for shipping then substract the shipping tax from the tax portion
    return {
      ...taxPortion,
      amount: {
        ...taxPortion.amount,
        centAmount:
          taxPortion.amount.centAmount - foundShippingTaxPortion.taxAmount,
      },
    };
  });
}

/*
---------------------------------------------------------------
Main Functions
---------------------------------------------------------------
*/

export function getShippingPrices(
  order: Pick<TCart, 'shippingInfo'>
): NetAndGross | null {
  const { shippingInfo } = order;

  if (!shippingInfo) {
    return null;
  }

  const hasTaxes = Boolean(shippingInfo.taxedPrice);
  const hasDiscounts = Boolean(shippingInfo.discountedPrice?.value);

  if (hasTaxes)
    return {
      net: shippingInfo.taxedPrice?.totalNet,
      gross: shippingInfo.taxedPrice?.totalGross,
    };
  if (hasDiscounts)
    return {
      net: shippingInfo.discountedPrice?.value,
      gross: shippingInfo.discountedPrice?.value,
    };

  return {
    net: shippingInfo.price,
    gross: shippingInfo.price,
  };
}

export function getShippingPricesMulti(order: TCart) {
  const shippings = getMultiShippings(order);

  const initialPrice: NetAndGross = {
    net: { centAmount: 0, fractionDigits: 2, type: '', currencyCode: '' },
    gross: { centAmount: 0, fractionDigits: 2, type: '', currencyCode: '' },
  };

  return shippings.reduce((acc, currentShipping): NetAndGross => {
    const currentShippingPrice = getShippingPrices({
      shippingInfo: currentShipping.shippingInfo,
    });

    return {
      net: {
        type: currentShippingPrice?.net?.type || '',
        fractionDigits: currentShippingPrice?.net?.fractionDigits || 2,
        currencyCode: currentShippingPrice?.net?.currencyCode || '',
        centAmount:
          (acc.net?.centAmount || 0) +
          (currentShippingPrice?.net?.centAmount || 0),
      },
      gross: {
        type: currentShippingPrice?.gross?.type || '',
        fractionDigits: currentShippingPrice?.gross?.fractionDigits || 2,
        currencyCode: currentShippingPrice?.gross?.currencyCode || '',
        centAmount:
          (acc.gross?.centAmount || 0) +
          (currentShippingPrice?.gross?.centAmount || 0),
      },
    };
  }, initialPrice);
}

export function getNetPriceWithoutShipping(order: TCart) {
  const shippingPrices = getShippingPrices(order);
  const cartDiscountOnTotalPrice = getNetCartDiscountOnTotalPrice(order);
  const { taxedPrice, totalPrice } = order;
  const orderTotalPrice = taxedPrice ? taxedPrice.totalNet : totalPrice;

  if (shippingPrices && cartDiscountOnTotalPrice && shippingPrices.net) {
    return {
      ...orderTotalPrice,
      centAmount:
        orderTotalPrice.centAmount +
        cartDiscountOnTotalPrice.centAmount -
        shippingPrices.net.centAmount,
    };
  }

  if (shippingPrices && shippingPrices.net)
    return {
      ...orderTotalPrice,
      centAmount: orderTotalPrice.centAmount - shippingPrices.net.centAmount,
    };

  if (cartDiscountOnTotalPrice) {
    return {
      ...orderTotalPrice,
      centAmount:
        orderTotalPrice.centAmount + cartDiscountOnTotalPrice.centAmount,
    };
  }

  return orderTotalPrice;
}

export function getGrossPriceWithoutShipping(order: TCart) {
  const shippingPrices = getShippingPrices(order);
  const cartDiscountOnTotalPrice = getCartDiscountOnTotalPrice(order);
  const { taxedPrice, totalPrice } = order;
  const orderTotalPrice = taxedPrice ? taxedPrice.totalGross : totalPrice;

  if (shippingPrices && cartDiscountOnTotalPrice && shippingPrices.gross)
    return {
      ...orderTotalPrice,
      centAmount:
        orderTotalPrice.centAmount +
        cartDiscountOnTotalPrice.centAmount -
        shippingPrices.gross.centAmount,
    };

  if (shippingPrices && shippingPrices.gross)
    return {
      ...orderTotalPrice,
      centAmount: orderTotalPrice.centAmount - shippingPrices.gross.centAmount,
    };

  if (cartDiscountOnTotalPrice) {
    return {
      ...orderTotalPrice,
      centAmount:
        orderTotalPrice.centAmount + cartDiscountOnTotalPrice.centAmount,
    };
  }

  return orderTotalPrice;
}

export function getGrossPriceWithoutShippingMulti(order: TCart) {
  const shippingPrices = getShippingPricesMulti(order);
  const cartDiscountOnTotalPrice = getCartDiscountOnTotalPrice(order);
  const { taxedPrice, totalPrice } = order;
  const orderTotalPrice = taxedPrice ? taxedPrice.totalGross : totalPrice;

  if (shippingPrices && cartDiscountOnTotalPrice)
    return {
      ...orderTotalPrice,
      centAmount:
        orderTotalPrice.centAmount +
        cartDiscountOnTotalPrice.centAmount -
        (shippingPrices.gross?.centAmount || 0),
    };

  if (shippingPrices)
    return {
      ...orderTotalPrice,
      centAmount:
        orderTotalPrice.centAmount - (shippingPrices.gross?.centAmount || 0),
    };

  if (cartDiscountOnTotalPrice) {
    return {
      ...orderTotalPrice,
      centAmount:
        orderTotalPrice.centAmount + cartDiscountOnTotalPrice.centAmount,
    };
  }

  return orderTotalPrice;
}

export const getTotalDiscount = (order: TCart) => {
  const {
    lineItems,
    customLineItems,
    totalPrice: { currencyCode, fractionDigits },
  } = order;
  const allLineItems = [...lineItems, ...customLineItems];
  const totalDiscount =
    getTotalProductDiscount(lineItems) + getTotalCartDiscount(allLineItems);

  return totalDiscount > 0
    ? {
        currencyCode,
        centAmount: totalDiscount,
        fractionDigits,
      }
    : null;
};

export const getNetTotalDiscount = (
  subtotalWithoutDiscounts: TMoney,
  order: TCart
) => {
  const AllLineItems = [...order.lineItems, ...order.customLineItems];

  // discounted total price of each item before taxes
  const allLineItemsTotalNetPrice = AllLineItems.reduce(
    (acc, item) => {
      return (
        acc +
        (item.taxedPrice
          ? item.taxedPrice.totalNet.centAmount
          : item.totalPrice?.centAmount || 0)
      );
    },

    0
  );

  return {
    ...subtotalWithoutDiscounts,
    centAmount: subtotalWithoutDiscounts.centAmount - allLineItemsTotalNetPrice,
  };
};

export function subtotalWithoutDiscounts(order: TCart): TMoney {
  const allItems = [...order.lineItems, ...order.customLineItems];

  return {
    ...order.totalPrice, // to get `currencyCode` and `fractionDigits`
    centAmount: calculateSubtotalCentAmount(
      allItems,
      order.totalPrice.fractionDigits
    ),
  };
}

export function subtotalWithoutDiscountsMutli(order: TCart) {
  const allItems = [...order.lineItems, ...order.customLineItems];

  const transformedItems = transformItemsFromMultiToSingle(allItems);

  return {
    ...order.totalPrice, // to get `currencyCode` and `fractionDigits`
    centAmount: calculateSubtotalCentAmount(
      transformedItems,
      order.totalPrice.fractionDigits
    ),
  };
}

export function getOrderSubtotalAfterDiscount(
  subtotalWithoutDiscounts: TMoney,
  totalDiscount: TMoney | null
) {
  return {
    ...subtotalWithoutDiscounts,
    centAmount:
      subtotalWithoutDiscounts.centAmount - (totalDiscount?.centAmount || 0),
  };
}

export function getTotalNetWithoutDiscounts(
  subtotal: TMoney,
  totalDiscount: TMoney
) {
  return totalDiscount
    ? {
        ...subtotal,
        centAmount: subtotal.centAmount + totalDiscount.centAmount,
      }
    : subtotal;
}

export function getTotalShippingDiscounts(
  order: Pick<TCart, 'shippingInfo'>
): TBaseMoney {
  const initialPrice = {
    centAmount: 0,
    currencyCode: '',
    fractionDigits: 2,
    type: '',
  };

  const shippingDiscounts = getShippingDiscounts(order);
  return shippingDiscounts
    ? shippingDiscounts.reduce(
        (total, discount) => ({
          ...discount.discountedAmount,
          centAmount: total.centAmount + discount.discountedAmount.centAmount,
        }),
        initialPrice
      )
    : initialPrice;
}

export function getTotalShippingDiscountsMulti(
  order: TCart
): TBaseMoney | null {
  const initialPrice = {
    centAmount: 0,
    currencyCode: 'EUR',
    fractionDigits: 2,
    type: '',
  };

  const shippingDiscounts = getShippingDiscountsMulti(order);
  return shippingDiscounts
    ? shippingDiscounts.reduce(
        (total, discount) => ({
          ...discount.discountedAmount,
          centAmount: total.centAmount + discount.discountedAmount.centAmount,
        }),
        initialPrice
      )
    : null;
}

export function getAllNonShippingTaxes(
  order: Pick<TCart, 'taxedPrice' | 'shippingInfo'>
) {
  const { taxedPrice, shippingInfo } = order;

  // no taxes for this order
  if (!taxedPrice || !shippingInfo) return [];

  // shipping has no taxes, return all taxes
  if (taxedPrice && (!shippingInfo || !shippingInfo.taxedPrice)) {
    return taxedPrice.taxPortions;
  }

  // final option
  const shippingPrice = getShippingPrices({ shippingInfo });
  const shippingTaxAmount =
    (shippingPrice?.gross?.centAmount || 0) -
    (shippingPrice?.net?.centAmount || 0);
  const { taxRate } = shippingInfo;

  // if tax rate has subrates then treat the subrates as separate tax rates and calculate their `taxAmount`
  // as a percentage of the intial tax rate
  const shippingTaxPortions = getShippingTaxPortionsFromTaxRate(
    taxRate,
    shippingTaxAmount
  );

  // find tax portions that are applied only to items and not shipping
  const filteredTaxPortions = taxedPrice.taxPortions.filter(
    (taxedPricePortion) => {
      return !shippingTaxPortions.some(
        (shippingTaxPortion) =>
          taxedPricePortion.name === shippingTaxPortion.name &&
          taxedPricePortion.rate === shippingTaxPortion.amount &&
          taxedPricePortion.amount.centAmount === shippingTaxPortion.taxAmount
      );
    }
  );

  // find tax portions applied to both items and shipping and substract the shipping tax
  return extractLineItemTaxPortions(filteredTaxPortions, shippingTaxPortions);
}

export function getAllNonShippingMultiTaxes(
  order: Pick<TCart, 'shipping' | 'taxedPrice'>
) {
  const { taxedPrice, shipping } = order;

  // no taxes for this order
  if (!taxedPrice) return [];

  const shippingTaxPortions = getMultiShippingTaxPortions(shipping);

  // when no shipping methods are available, or shippings have no taxes, then return all taxes
  if (
    taxedPrice &&
    (shipping.length === 0 ||
      shippingTaxPortions.every(
        (shippingTaxPortion) => !shippingTaxPortion.hasOwnProperty('name')
      ))
  ) {
    return taxedPrice.taxPortions;
  }

  // find tax portions that are applied only to items and not shipping
  const filteredTaxPortions = taxedPrice.taxPortions.filter(
    (taxedPricePortion) => {
      return !shippingTaxPortions.some(
        (shippingTaxPortion) =>
          taxedPricePortion.name === shippingTaxPortion.name &&
          taxedPricePortion.rate === shippingTaxPortion.amount &&
          taxedPricePortion.amount.centAmount === shippingTaxPortion.taxAmount
      );
    }
  );

  // find tax portions applied to both items and shipping and substract the shipping tax
  return extractLineItemTaxPortions(filteredTaxPortions, shippingTaxPortions);
}
