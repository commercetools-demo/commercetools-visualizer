import {
  MISSING_DISCOUNT_CODE,
  OUTDATED_DISCOUNT_CODE,
} from '../cart-applied-discounts-panel/cart-applied-discounts-panel';
import omitEmpty from 'omit-empty-es';

const transformErrors = (apiErrors: Array<any>) => {
  const formErrors: Array<any> = [];
  const unmappedErrors: Array<any> = [];

  if (!Array.isArray(apiErrors))
    return {
      formErrors,
      unmappedErrors: [apiErrors],
    };

  apiErrors.forEach((graphQLError) => {
    if (
      (graphQLError?.extensions?.code ?? graphQLError?.code) ===
      'DiscountCodeNonApplicable'
    ) {
      // Error when the discount code does not exist
      if (graphQLError?.reason === 'DoesNotExist') {
        return formErrors.push({ code: MISSING_DISCOUNT_CODE });
      }
      if (graphQLError?.action?.code === 'expired') {
        // else it's outdated outdatedDiscountCode
        return formErrors.push({ code: OUTDATED_DISCOUNT_CODE });
      }
    }
    return unmappedErrors.push(graphQLError);
  });

  return {
    formErrors: omitEmpty(formErrors),
    unmappedErrors,
  };
};

export default transformErrors;
