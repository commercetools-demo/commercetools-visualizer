import { FC } from 'react';
import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { FormField, Heading, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import { validateInput } from './validate';

type Props = {
  isReadOnly?: boolean;
};

const AzureEventGridDestination: FC<Props> = ({ isReadOnly }) => {
  const [uriField, uriMeta, uriHelpers] = useField<string>({
    name: 'destination.EventGrid.uri',
    validate: validateInput,
  });
  const [accessKeyField, accessKeyMeta, accessKeyHelpers] = useField<string>({
    name: 'destination.EventGrid.accessKey',
    validate: validateInput,
  });
  return (
    <>
      <Heading as="h3" size="sm">
        <FormattedMessage {...messages.configureAzureEventGridHeading} />
      </Heading>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(uriMeta.touched && uriMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationAzureEventGridUri} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={uriField.name}
            value={uriMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => uriHelpers.setTouched(true)}
            onChange={(value) => uriHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {uriMeta.touched && uriMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(accessKeyMeta.touched && accessKeyMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationAzureEventGridAccessKey} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={accessKeyField.name}
            value={accessKeyMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => accessKeyHelpers.setTouched(true)}
            onChange={(value) => accessKeyHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {accessKeyMeta.touched && accessKeyMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
    </>
  );
};

export default AzureEventGridDestination;
