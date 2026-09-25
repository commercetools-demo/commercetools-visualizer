import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { FC } from 'react';
import { FormField, Select, Stack, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import {
  DestinationHttpAuthenticationName,
  TFormValues,
} from '../extensions-form/extensions-form';

type Props = {
  formik: ReturnType<typeof useFormik<TFormValues>>;
  isReadOnly?: boolean;
};

const ExtensionsDestinationsFormHttp: FC<Props> = ({ formik, isReadOnly }) => {
  const intl = useIntl();
  return (
    <Stack direction="column" gap="400">
      <FormField.Root isRequired isReadOnly={isReadOnly}>
        <FormField.Label>
          {intl.formatMessage(messages.destinationHttpUrl)}
        </FormField.Label>
        <FormField.Input>
          <TextInput
            aria-label={intl.formatMessage(messages.destinationHttpUrl)}
            value={formik.values.destinationHttpUrl || ''}
            isReadOnly={isReadOnly}
            onChange={(value) =>
              formik.setFieldValue('destinationHttpUrl', value)
            }
            onBlur={() => formik.setFieldTouched('destinationHttpUrl', true)}
          />
        </FormField.Input>
      </FormField.Root>
      <FormField.Root isReadOnly={isReadOnly}>
        <FormField.Label>
          {intl.formatMessage(messages.destinationHttpAuthentication)}
        </FormField.Label>
        <FormField.Input>
          <Select.Root
            aria-label={intl.formatMessage(
              messages.destinationHttpAuthentication
            )}
            isClearable
            isDisabled={isReadOnly}
            value={formik.values.destinationHttpAuthenticationName || ''}
            onChange={(value) =>
              formik.setFieldValue(
                'destinationHttpAuthenticationName',
                value as DestinationHttpAuthenticationName
              )
            }
            onBlur={() =>
              formik.setFieldTouched('destinationHttpAuthenticationName', true)
            }
          >
            <Select.Options>
              <Select.Option id="AzureFunctions">
                {intl.formatMessage(
                  messages.destinationHttpAuthenticationAzureFunctions
                )}
              </Select.Option>
              <Select.Option id="AuthorizationHeader">
                {intl.formatMessage(
                  messages.destinationHttpAuthenticationAuthorizationHeader
                )}
              </Select.Option>
            </Select.Options>
          </Select.Root>
        </FormField.Input>
      </FormField.Root>
      {formik.values.destinationHttpAuthenticationName ===
        'AuthorizationHeader' && (
        <FormField.Root isReadOnly={isReadOnly}>
          <FormField.Label>Authorization header</FormField.Label>
          <FormField.Input>
            <TextInput
              aria-label="Authorization header"
              value={
                formik.values
                  .destinationHttpAuthenticationAuthorizationHeaderValue || ''
              }
              isReadOnly={isReadOnly}
              onChange={(value) =>
                formik.setFieldValue(
                  'destinationHttpAuthenticationAuthorizationHeaderValue',
                  value
                )
              }
              onBlur={() =>
                formik.setFieldTouched(
                  'destinationHttpAuthenticationAuthorizationHeaderValue',
                  true
                )
              }
            />
          </FormField.Input>
        </FormField.Root>
      )}
      {formik.values.destinationHttpAuthenticationName === 'AzureFunctions' && (
        <FormField.Root isReadOnly={isReadOnly}>
          <FormField.Label>Authorization Key</FormField.Label>
          <FormField.Input>
            <TextInput
              aria-label="Authorization Key"
              value={
                formik.values.destinationHttpAuthenticationAuthorizationKey ||
                ''
              }
              isReadOnly={isReadOnly}
              onChange={(value) =>
                formik.setFieldValue(
                  'destinationHttpAuthenticationAuthorizationKey',
                  value
                )
              }
              onBlur={() =>
                formik.setFieldTouched(
                  'destinationHttpAuthenticationAuthorizationKey',
                  true
                )
              }
            />
          </FormField.Input>
        </FormField.Root>
      )}
    </Stack>
  );
};

export default ExtensionsDestinationsFormHttp;
