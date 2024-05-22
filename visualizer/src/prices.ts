import isNil from 'lodash/isNil';
import { PRECISION_TYPES } from './constants';
import { getFractionedAmount } from './helpers';

export function getPriceChannelName(price: any) {
  return price.channel?.name ?? price.channel?.key ?? null;
}

export function getDiscountValue(price: any) {
  let preciseAmount;
  let fractionedAmount;
  if (
    price.value?.type === PRECISION_TYPES.highPrecision &&
    price.discounted.value.type === PRECISION_TYPES.highPrecision
  ) {
    preciseAmount =
      price.value.preciseAmount - price.discounted.value.preciseAmount;
  } else if (
    price.value?.type === PRECISION_TYPES.highPrecision &&
    price.discounted?.value?.type === PRECISION_TYPES.centPrecision
  ) {
    fractionedAmount =
      getFractionedAmount(price.value) -
      getFractionedAmount(price.discounted.value);
  }

  return price.discounted
    ? {
        ...price.value,
        fractionedAmount,
        centAmount: price.value.centAmount - price.discounted.value.centAmount,
        preciseAmount,
      }
    : { ...price.value, centAmount: 0 };
}

export function getSelectedPrice(price: any) {
  return price.discounted ? price.discounted : price;
}

export function getNetUnitPrice({ lineItem, shouldRoundAmount }: any) {
  const price = getSelectedPrice(lineItem.price);

  const filteredPerMethodTaxRate = lineItem?.perMethodTaxRate?.filter(
    (perMethodTax: any) =>
      lineItem?.shippingDetails?.targets?.findIndex(
        (target: any) =>
          target?.shippingMethodKey === perMethodTax?.shippingMethodKey
      ) >= 0
  );

  // when shipping mode is multi with the same tax rate
  if (
    filteredPerMethodTaxRate?.length > 0 &&
    filteredPerMethodTaxRate[0]?.taxRate?.includedInPrice
  ) {
    const taxRate = filteredPerMethodTaxRate[0].taxRate;
    let centAmount;
    // should accept 0 value
    if (typeof price.value?.centAmount === 'number') {
      const amount = price.value.centAmount / (1 + taxRate.amount);
      centAmount = shouldRoundAmount ? Math.round(amount) : amount;
    }

    let preciseAmount;
    if (price.value?.type === PRECISION_TYPES.highPrecision)
      preciseAmount = price.value.preciseAmount / (1 + taxRate.amount);

    return {
      ...price.value,
      centAmount,
      preciseAmount,
    };
  }

  // when shipping mode is single
  if (lineItem.taxRate && lineItem.taxRate.includedInPrice) {
    let centAmount;
    // should accept 0 value
    if (typeof price.value?.centAmount === 'number') {
      const amount = price.value.centAmount / (1 + lineItem.taxRate.amount);
      centAmount = shouldRoundAmount ? Math.round(amount) : amount;
    }

    let preciseAmount;
    if (price.value?.type === PRECISION_TYPES.highPrecision)
      preciseAmount = price.value.preciseAmount / (1 + lineItem.taxRate.amount);

    return {
      ...price.value,
      centAmount,
      preciseAmount,
    };
  }
  return price.value;
}

export function getMinimumPricesByCurrencyCode(prices: any) {
  const minPricesByCurrency = prices.reduce((minPrices: any, price: any) => {
    const currencyCode = price.value.currencyCode;
    const fractionedAmount = getFractionedAmount(price.value);

    if (currencyCode && !isNil(fractionedAmount)) {
      if (
        !minPrices[currencyCode] ||
        fractionedAmount < getFractionedAmount(minPrices[currencyCode])
      )
        return {
          ...minPrices,
          [currencyCode]: price.value,
        };
    }
    return minPrices;
  }, {});

  return Object.values(minPricesByCurrency);
}
