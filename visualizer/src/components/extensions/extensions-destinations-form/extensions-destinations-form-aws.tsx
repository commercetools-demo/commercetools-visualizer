import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { FormField, Stack, TextInput } from '@commercetools/nimbus';
import { TFormValues } from '../extensions-form/extensions-form';
import { FC } from 'react';
import messages from './messages';

type Props = {
  formik: ReturnType<typeof useFormik<TFormValues>>;
  isReadOnly?: boolean;
};

const ExtensionsDestinationsFormAws: FC<Props> = ({ formik, isReadOnly }) => {
  const intl = useIntl();
  return (
    <Stack direction="column" gap="400">
      <FormField.Root isRequired isReadOnly={isReadOnly}>
        <FormField.Label>
          {intl.formatMessage(messages.destinationAwsArn)}
        </FormField.Label>
        <FormField.Input>
          <TextInput
            aria-label={intl.formatMessage(messages.destinationAwsArn)}
            value={formik.values.destinationAwsArn || ''}
            isReadOnly={isReadOnly}
            onChange={(value) =>
              formik.setFieldValue('destinationAwsArn', value)
            }
            onBlur={() => formik.setFieldTouched('destinationAwsArn', true)}
          />
        </FormField.Input>
      </FormField.Root>
      <FormField.Root isRequired isReadOnly={isReadOnly}>
        <FormField.Label>
          {intl.formatMessage(messages.destinationAwsAccessKey)}
        </FormField.Label>
        <FormField.Input>
          <TextInput
            aria-label={intl.formatMessage(messages.destinationAwsAccessKey)}
            value={formik.values.destinationAwsAccessKey || ''}
            isReadOnly={isReadOnly}
            onChange={(value) =>
              formik.setFieldValue('destinationAwsAccessKey', value)
            }
            onBlur={() =>
              formik.setFieldTouched('destinationAwsAccessKey', true)
            }
          />
        </FormField.Input>
      </FormField.Root>
      <FormField.Root isRequired isReadOnly={isReadOnly}>
        <FormField.Label>
          {intl.formatMessage(messages.destinationAwsAccessSecret)}
        </FormField.Label>
        <FormField.Input>
          <TextInput
            aria-label={intl.formatMessage(messages.destinationAwsAccessSecret)}
            value={formik.values.destinationAwsAccessSecret || ''}
            isReadOnly={isReadOnly}
            onChange={(value) =>
              formik.setFieldValue('destinationAwsAccessSecret', value)
            }
            onBlur={() =>
              formik.setFieldTouched('destinationAwsAccessSecret', true)
            }
          />
        </FormField.Input>
      </FormField.Root>
    </Stack>
  );
};

export default ExtensionsDestinationsFormAws;
