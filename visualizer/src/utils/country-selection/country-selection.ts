import { TPrice } from '@commercetools-test-data/commons';

export const getMatchingPrices = (
  prices: Array<TPrice>,
  cartCurrency: string,
  cartCustomerGroupId: string
) =>
  prices.filter(
    (price) =>
      price.value &&
      price.value.currencyCode === cartCurrency &&
      (!price.customerGroup || price.customerGroup.id === cartCustomerGroupId)
  );

export const getAvailableCountries = (
  prices: Array<TPrice>,
  storeCountries: Array<any>
) =>
  prices.reduce<Array<string>>((availableCountries, price) => {
    if (
      price.country &&
      !availableCountries.includes(price.country) &&
      (!storeCountries ||
        !storeCountries.length ||
        storeCountries.some(({ code }) => code === price.country))
    ) {
      availableCountries.push(price.country);
    }
    return availableCountries;
  }, []);
