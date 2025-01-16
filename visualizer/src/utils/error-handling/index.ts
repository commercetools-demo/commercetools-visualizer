import { useShowNotification } from '@commercetools-frontend/actions-global';
import { transformErrors } from '../../components/subscriptions/transform-errors';
import {
  DOMAINS,
  type TAppNotificationApiError,
} from '@commercetools-frontend/constants';
import { FormikHelpers } from 'formik';

type ShowNotification = ReturnType<typeof useShowNotification>;

export function graphQLErrorHandler<T>(
  showNotification: ShowNotification,
  formikHelpers?: FormikHelpers<T>
) {
  return (graphQLErrors: unknown) => {
    const transformedErrors = transformErrors(graphQLErrors);
    let unmappedErrors = (
      Array.isArray(transformedErrors.unmappedErrors)
        ? transformedErrors.unmappedErrors
        : [transformedErrors.unmappedErrors]
    ) as Array<TAppNotificationApiError>;

    if (unmappedErrors.length > 0) {
      unmappedErrors.map((error, index) => {
        return showNotification({
          kind: 'error',
          domain: index === 0 ? DOMAINS.PAGE : DOMAINS.SIDE,
          text: error.message,
        });
      });
    }
    // @ts-ignore
    formikHelpers && formikHelpers.setErrors(transformedErrors.formErrors);
  };
}
