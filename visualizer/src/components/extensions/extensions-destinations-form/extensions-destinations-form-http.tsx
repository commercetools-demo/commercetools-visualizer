import { useFormik } from 'formik';
import TextField from '@commercetools-uikit/text-field';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { TFormValues } from '../extensions-form/extensions-form';
import { FC } from 'react';
import SelectField from '@commercetools-uikit/select-field';

type Props = {
  formik: ReturnType<typeof useFormik<TFormValues>>;
};

const ExtensionsDestinationsFormHttp: FC<Props> = ({ formik }) => {
  return (
    <>
      <TextField
        name="destinationHttpUrl"
        isRequired
        value={formik.values.destinationHttpUrl || ''}
        title={<FormattedMessage {...messages.destinationHttpUrl} />}
        errors={
          TextField.toFieldErrors<TFormValues>(formik.errors).destinationHttpUrl
        }
        touched={!!formik.touched.destinationHttpUrl}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
      />
      <SelectField
        key={'destinationHttpAuthenticationName'}
        title={<FormattedMessage {...messages.destinationHttpAuthentication} />}
        errors={
          SelectField.toFieldErrors<TFormValues>(formik.errors)
            .destinationHttpAuthenticationName
        }
        name={
          formik.values.destinationHttpAuthenticationName ||
          'destinationHttpAuthenticationName'
        }
        isClearable={true}
        options={[
          {
            value: 'AzureFunctions',
            label: (
              <FormattedMessage
                {...messages.destinationHttpAuthenticationAzureFunctions}
              />
            ),
          },
          {
            value: 'AuthorizationHeader',
            label: (
              <FormattedMessage
                {...messages.destinationHttpAuthenticationAuthorizationHeader}
              />
            ),
          },
        ]}
        value={formik.values.destinationHttpAuthenticationName || ''}
        touched={!!formik.touched.destinationHttpAuthenticationName}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
      />
      {formik.values.destinationHttpAuthenticationName &&
        formik.values.destinationHttpAuthenticationName ===
          'AuthorizationHeader' && (
          <TextField
            name="destinationHttpAuthenticationAuthorizationHeaderValue"
            value={
              formik.values
                .destinationHttpAuthenticationAuthorizationHeaderValue || ''
            }
            title={'Authorization header'}
            errors={
              TextField.toFieldErrors<TFormValues>(formik.errors)
                .destinationHttpAuthenticationAuthorizationHeaderValue
            }
            touched={
              !!formik.touched
                .destinationHttpAuthenticationAuthorizationHeaderValue
            }
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
        )}
      {formik.values.destinationHttpAuthenticationName &&
        formik.values.destinationHttpAuthenticationName ===
          'AzureFunctions' && (
          <TextField
            name="destinationHttpAuthenticationAuthorizationKey"
            value={
              formik.values.destinationHttpAuthenticationAuthorizationKey || ''
            }
            title={'Authorization Key'}
            errors={
              TextField.toFieldErrors<TFormValues>(formik.errors)
                .destinationHttpAuthenticationAuthorizationKey
            }
            touched={
              !!formik.touched.destinationHttpAuthenticationAuthorizationKey
            }
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
        )}
    </>
  );
};

export default ExtensionsDestinationsFormHttp;
