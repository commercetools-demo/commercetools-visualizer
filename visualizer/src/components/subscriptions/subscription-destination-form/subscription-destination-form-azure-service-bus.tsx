import { FC } from 'react';
import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { FormField, Heading, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import { validateInput } from './validate';

type Props = {
  isReadOnly?: boolean;
};

const AzureServiceBusDestination: FC<Props> = ({ isReadOnly }) => {
  const [connectionStringField, connectionStringMeta, connectionStringHelpers] =
    useField<string>({
      name: 'destination.AzureServiceBus.connectionString',
      validate: validateInput,
    });
  return (
    <>
      <Heading as="h3" size="sm">
        <FormattedMessage {...messages.configureAzureServiceBusHeading} />
      </Heading>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(
          connectionStringMeta.touched && connectionStringMeta.error
        )}
      >
        <FormField.Label>
          <FormattedMessage
            {...messages.destinationAzureServiceBusConnectionString}
          />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={connectionStringField.name}
            value={connectionStringMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => connectionStringHelpers.setTouched(true)}
            onChange={(value) => connectionStringHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {connectionStringMeta.touched && connectionStringMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
    </>
  );
};

export default AzureServiceBusDestination;
