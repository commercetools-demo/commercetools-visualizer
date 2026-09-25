import { useShowNotification } from '@commercetools-frontend/actions-global';
import {
  DOMAINS,
  type TAppNotificationApiError,
} from '@commercetools-frontend/constants';
import { FormikErrors, FormikHelpers } from 'formik';
import omitEmpty from 'omit-empty-es';

export type ErrorCodeMapping = Array<{
  errorCode: string;
  errorObject: Record<string, unknown>;
}>;

type TransformedErrors<T> = {
  unmappedErrors: unknown[];
  formErrors: FormikErrors<T>;
};

type TGraphQlErrorLike = {
  message: string;
  code?: string;
  field?: string;
  extensions?: { code?: string; field?: string };
};

const transformErrors = <T>(
  graphQlErrors: unknown,
  errorCodeMapping?: ErrorCodeMapping
): TransformedErrors<T> => {
  const errorsToMap = (
    Array.isArray(graphQlErrors) ? graphQlErrors : [graphQlErrors]
  ) as Array<TGraphQlErrorLike>;

  const { formErrors, unmappedErrors } = errorsToMap.reduce<
    TransformedErrors<T>
  >(
    (transformedErrors, graphQlError) => {
      const errorCode = graphQlError?.extensions?.code ?? graphQlError.code;
      const fieldName =
        graphQlError?.extensions?.field ?? graphQlError.field ?? '';

      const mapped =
        errorCodeMapping &&
        errorCodeMapping.find(
          (errorMapping) => errorMapping.errorCode === errorCode
        );
      if (mapped) {
        transformedErrors.formErrors = {
          ...transformedErrors.formErrors,
          [fieldName]: mapped.errorObject,
        };
      } else {
        transformedErrors.unmappedErrors.push(graphQlError);
      }
      return transformedErrors;
    },
    {
      formErrors: {}, // will be mapped to form field error messages
      unmappedErrors: [], // will result in dispatching an API error notification
    }
  );

  return {
    formErrors: omitEmpty(formErrors),
    unmappedErrors,
  };
};

type ShowNotification = ReturnType<typeof useShowNotification>;

export function graphQLErrorHandler<T>(
  showNotification: ShowNotification,
  formikHelpers?: FormikHelpers<T>,
  errorCodeMapping?: ErrorCodeMapping
) {
  return (graphQLErrors: unknown) => {
    const transformedErrors = transformErrors<T>(
      graphQLErrors,
      errorCodeMapping
    );
    const unmappedErrors = (
      Array.isArray(transformedErrors.unmappedErrors)
        ? transformedErrors.unmappedErrors
        : [transformedErrors.unmappedErrors]
    ) as Array<TAppNotificationApiError>;

    if (unmappedErrors.length > 0) {
      unmappedErrors.forEach((error, index) => {
        showNotification({
          kind: 'error',
          domain: index === 0 ? DOMAINS.PAGE : DOMAINS.SIDE,
          text: error.message,
        });
      });
    }
    formikHelpers && formikHelpers.setErrors(transformedErrors.formErrors);
  };
}
