import { useFormikContext } from 'formik';
import { useIntl } from 'react-intl';
import { FC } from 'react';
import { FormField, Stack, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import { TFormValues } from '../extensions-form/extensions-form';

type Props = {
  isReadOnly?: boolean;
};

const ExtensionsDestinationsFormGcf: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();
  const formik = useFormikContext<TFormValues>();
  return (
    <Stack direction="column" gap="400">
      <FormField.Root isRequired isReadOnly={isReadOnly}>
        <FormField.Label>
          {intl.formatMessage(messages.destinationGcfUrl)}
        </FormField.Label>
        <FormField.Input>
          <TextInput
            aria-label={intl.formatMessage(messages.destinationGcfUrl)}
            value={formik.values.destinationGcfUrl || ''}
            isReadOnly={isReadOnly}
            onChange={(value) =>
              formik.setFieldValue('destinationGcfUrl', value)
            }
            onBlur={() => formik.setFieldTouched('destinationGcfUrl', true)}
            width={'full'}
          />
        </FormField.Input>
      </FormField.Root>
    </Stack>
  );
};

export default ExtensionsDestinationsFormGcf;
