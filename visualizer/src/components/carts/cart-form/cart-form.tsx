import { FC, ReactElement, useCallback, useState } from 'react';
import { FormikHelpers, useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import omitEmpty from 'omit-empty-es';
import { PageContentWide } from '@commercetools-frontend/application-components';
import Spacings from '@commercetools-uikit/spacings';
import SelectField from '@commercetools-uikit/select-field';
import messages from './messages';
import {
  useShowApiErrorNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import AsyncSelectInput from '@commercetools-uikit/async-select-input';
import useCustomerSearchFetcher from '../../../hooks/use-customer-search-fetcher';
type Formik = ReturnType<typeof useFormik>;

type TErrors = {
  currency: { missing?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    currency: {},
  };

  if (!formikValues.currency || formikValues.currency.length === 0) {
    errors.currency.missing = true;
  }

  return omitEmpty<TErrors>(errors);
};

export type TFormValues = {
  currency: string;
  user: { value: string; label: string };
};

type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
};

type Props = {
  onSubmit: (
    values: TFormValues,
    formikHelpers: FormikHelpers<TFormValues>
  ) => void | Promise<unknown>;
  initialValues: TFormValues;
  children: (formProps: FormProps) => JSX.Element;
  createNewMode?: boolean;
};

const CartForm: FC<Props> = ({
  children,
  initialValues,
  onSubmit,
  createNewMode = false,
}) => {
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate,
    enableReinitialize: true,
  });
  const { currencies } = useApplicationContext((context) => ({
    currencies: context.project?.currencies ?? [],
  }));
  const intl = useIntl();

  const [searchValue, setSearchValue] = useState('');

  const handleMaximumQueryLimitReached = useCallback(() => {
    showNotification({
      kind: 'warning',
      domain: DOMAINS.PAGE,
      text: intl.formatMessage(messages.invalidInputError),
    });
  }, [showNotification, intl]);

  const handleSearchServiceNotAvailableError = useCallback(() => {
    showNotification({
      kind: 'error',
      domain: DOMAINS.PAGE,
      text: intl.formatMessage(messages.searchServiceNotAvailableError),
    });
  }, [intl, showNotification]);

  const handleErrors = useCallback(
    (error) => {
      if (error.code >= 400) {
        if (
          error.message ===
          "Invalid value for: body (Offset must be between 0 and 9900. at 'offset')"
        ) {
          handleMaximumQueryLimitReached();
        } else {
          showApiErrorNotification({ errors: error.body.errors });
        }
      } else if (error.code >= 500) {
        handleSearchServiceNotAvailableError();
      }
    },
    [
      handleMaximumQueryLimitReached,
      handleSearchServiceNotAvailableError,
      showApiErrorNotification,
    ]
  );

  const { fetch } = useCustomerSearchFetcher(searchValue, handleErrors);

  const formElements = (
    <PageContentWide columns="2/1" gapSize="20">
      <Spacings.Stack scale="xxxl">
        <Spacings.Stack scale="m">
          <SelectField
            name="currency"
            title={intl.formatMessage(messages.currencyTitle)}
            isRequired
            value={formik.values.currency}
            options={currencies.map((currency) => {
              return { value: currency, label: currency };
            })}
            errors={
              SelectField.toFieldErrors<TFormValues>(formik.errors).currency
            }
            touched={
              formik.touched.currency ? formik.touched.currency : undefined
            }
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            isDisabled={!createNewMode}
          />
          <AsyncSelectInput
            name={'user'}
            value={formik.values.user}
            placeholder={intl.formatMessage(messages.searchBarPlaceholder)}
            isClearable
            isSearchable
            cacheOptions={20}
            onInputChange={(newValue) => setSearchValue(newValue)}
            loadOptions={() =>
              fetch().then((customers) =>
                customers.map((customer) => {
                  let label = customer.firstName || '';
                  if (customer.lastName) {
                    label += ' ' + customer.lastName;
                  }
                  if (customer.key) {
                    label += ' (' + customer.key + ')';
                  }
                  if (customer.email) {
                    label += ' (' + customer.email + ')';
                  }
                  return {
                    value: customer.id,
                    label: label,
                  };
                })
              )
            }
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
        </Spacings.Stack>
      </Spacings.Stack>
    </PageContentWide>
  );
  return children({
    formElements,
    values: formik.values,
    isDirty: formik.dirty,
    isSubmitting: formik.isSubmitting,
    submitForm: formik.handleSubmit,
    handleReset: formik.handleReset,
  });
};

export default CartForm;
