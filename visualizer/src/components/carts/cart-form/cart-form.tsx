import { FC, ReactElement } from 'react';
import { FormikHelpers, useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import omitEmpty from 'omit-empty-es';
import { PageContentWide } from '@commercetools-frontend/application-components';
import Spacings from '@commercetools-uikit/spacings';
import SelectField from '@commercetools-uikit/select-field';
import messages from '../../states/states-form/messages';
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
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate,
    enableReinitialize: true,
  });
  const intl = useIntl();
  const { currencies } = useApplicationContext((context) => ({
    currencies: context.project?.currencies ?? [],
  }));

  const formElements = (
    <PageContentWide columns="2/1" gapSize="20">
      <Spacings.Stack scale="xxxl">
        <Spacings.Stack scale="m">
          <SelectField
            name="currency"
            title={intl.formatMessage(messages.stateTypeTitle)}
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
