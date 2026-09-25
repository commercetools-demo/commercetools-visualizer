import { useFormik } from 'formik';
import { FormField, Stack, TextInput } from '@commercetools/nimbus';
import { TFormValues } from '../extensions-form/extensions-form';
import { FC } from 'react';

type Props = {
  formik: ReturnType<typeof useFormik<TFormValues>>;
  isReadOnly?: boolean;
};

const ExtensionsDestinationsFormAws: FC<Props> = ({ formik, isReadOnly }) => {
  return (
    <Stack direction="column" gap="400">
      <FormField.Root isRequired isReadOnly={isReadOnly}>
        <FormField.Label>ARN</FormField.Label>
        <FormField.Input>
          <TextInput
            aria-label="ARN"
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
        <FormField.Label>AccessKey</FormField.Label>
        <FormField.Input>
          <TextInput
            aria-label="AccessKey"
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
        <FormField.Label>AccessSecret</FormField.Label>
        <FormField.Input>
          <TextInput
            aria-label="AccessSecret"
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
