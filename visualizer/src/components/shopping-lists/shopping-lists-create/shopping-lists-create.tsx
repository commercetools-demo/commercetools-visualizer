import { FC } from 'react';
import {
  FormModalPage,
  PageContentWide,
} from '@commercetools-frontend/application-components';
import { useIntl } from 'react-intl';
import { useFormik } from 'formik';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import Spacings from '@commercetools-uikit/spacings';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import CustomerSearch, {
  CustomerValue,
} from '../../customer-search/customer-search';
import omitEmpty from 'omit-empty-es';
import AsyncSelectField from '@commercetools-uikit/async-select-field';

type TFormValues = {
  name: Record<string, string>;
  customer?: CustomerValue;
};

type TErrors = {
  name: { missing?: boolean };
  customer: { missing?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    customer: {},
    name: {},
  };

  if (LocalizedTextInput.isEmpty(formikValues.name)) {
    errors.name.missing = true;
  }
  if (!formikValues.customer) {
    errors.customer.missing = true;
  }
  return omitEmpty<TErrors>(errors);
};

type Props = {
  onClose: () => void;
  onCreate: (id: string) => void;
};

export const ShoppingListsCreate: FC<Props> = ({ onClose }) => {
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const formik = useFormik<TFormValues>({
    initialValues: {
      name: LocalizedTextInput.createLocalizedString(
        projectLanguages,
        transformLocalizedFieldToLocalizedString([]) ?? {}
      ),
    },
    onSubmit: (values) => console.log(values),
    validate: validate,
  });
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  return (
    <FormModalPage
      title={'Create a Shopping List'}
      isOpen
      onPrimaryButtonClick={() => formik.submitForm()}
      onSecondaryButtonClick={onClose}
      onClose={onClose}
      hideControls={false}
      labelPrimaryButton={intl.formatMessage(FormModalPage.Intl.save)}
      isPrimaryButtonDisabled={
        formik.isSubmitting || !formik.dirty || !canManage
      }
    >
      <PageContentWide columns="2/1" gapSize="20">
        <Spacings.Stack scale="xxxl">
          <Spacings.Stack scale="m">
            <LocalizedTextField
              name="name"
              selectedLanguage={dataLocale}
              value={formik.values.name}
              title={'Name'}
              isRequired
              touched={!!formik.touched.name}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              errors={
                LocalizedTextField.toFieldErrors<TFormValues>(formik.errors)
                  .name
              }
            />
            <CustomerSearch
              title={'Customer'}
              name={'customer'}
              value={formik.values.customer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              touched={!!formik.touched.customer}
              errors={
                AsyncSelectField.toFieldErrors<TFormValues>(formik.errors)
                  .customer
              }
            />
          </Spacings.Stack>
        </Spacings.Stack>
      </PageContentWide>
    </FormModalPage>
  );
};

export default ShoppingListsCreate;
