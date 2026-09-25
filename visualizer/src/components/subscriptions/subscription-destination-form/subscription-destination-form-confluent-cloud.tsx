import { FC } from 'react';
import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { FormField, Heading, Select, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import { validateInput } from './validate';

type Props = {
  isReadOnly?: boolean;
};

const ACKS_OPTIONS = [
  { id: '0', label: '0' },
  { id: '1', label: '1' },
  { id: 'all', label: 'all' },
];

const ConfluentCloudDestination: FC<Props> = ({ isReadOnly }) => {
  const [bootstrapServerField, bootstrapServerMeta, bootstrapServerHelpers] =
    useField<string>({
      name: 'destination.ConfluentCloud.bootstrapServer',
    });

  const [apiKeyField, apiKeyMeta, apiKeyHelpers] = useField<string>({
    name: 'destination.ConfluentCloud.apiKey',
  });

  const [apiSecretField, apiSecretMeta, apiSecretHelpers] = useField<string>({
    name: 'destination.ConfluentCloud.apiSecret',
    validate: validateInput,
  });

  const [acksField, acksMeta, acksHelpers] = useField<string>({
    name: 'destination.ConfluentCloud.acks',
    validate: validateInput,
  });

  const [topicField, topicMeta, topicHelpers] = useField<string>({
    name: 'destination.ConfluentCloud.topic',
    validate: validateInput,
  });

  return (
    <>
      <Heading as="h3" size="sm">
        <FormattedMessage {...messages.configureConfluentCloudHeading} />
      </Heading>

      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(
          bootstrapServerMeta.touched && bootstrapServerMeta.error
        )}
      >
        <FormField.Label>
          <FormattedMessage
            {...messages.destinationConfluentCloudBootstrapServer}
            values={{
              cluster: '<xxxxx>',
              region: '<region>',
              provider: '<provider>',
            }}
          />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={bootstrapServerField.name}
            value={bootstrapServerMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => bootstrapServerHelpers.setTouched(true)}
            onChange={(value) => bootstrapServerHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {bootstrapServerMeta.touched && bootstrapServerMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(apiKeyMeta.touched && apiKeyMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationConfluentCloudApiKey} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={apiKeyField.name}
            value={apiKeyMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => apiKeyHelpers.setTouched(true)}
            onChange={(value) => apiKeyHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {apiKeyMeta.touched && apiKeyMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>

      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(apiSecretMeta.touched && apiSecretMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationConfluentCloudApiSecret} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={apiSecretField.name}
            value={apiSecretMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => apiSecretHelpers.setTouched(true)}
            onChange={(value) => apiSecretHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {apiSecretMeta.touched && apiSecretMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(acksMeta.touched && acksMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationConfluentCloudAcks} />
        </FormField.Label>
        <FormField.Input>
          <Select.Root
            name={acksField.name}
            value={acksMeta.value || ''}
            onChange={(value) => acksHelpers.setValue(value || '')}
            onBlur={() => acksHelpers.setTouched(true)}
            width={'full'}
          >
            <Select.Options>
              {ACKS_OPTIONS.map((option) => (
                <Select.Option key={option.id} id={option.id}>
                  {option.label}
                </Select.Option>
              ))}
            </Select.Options>
          </Select.Root>
        </FormField.Input>
        <FormField.Error>
          {acksMeta.touched && acksMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(topicMeta.touched && topicMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationConfluentCloudTopic} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={topicField.name}
            value={topicMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => topicHelpers.setTouched(true)}
            onChange={(value) => topicHelpers.setValue(value)}
          />
        </FormField.Input>
        <FormField.Error>
          {topicMeta.touched && topicMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
    </>
  );
};
export default ConfluentCloudDestination;
