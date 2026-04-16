import TextField from '@commercetools-uikit/text-field';
import { FC } from 'react';
import { useField } from 'formik';
import Text from '@commercetools-uikit/text';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { validateInput } from './validate';
import SelectField from '@commercetools-uikit/select-field';

type Props = {
  isReadOnly?: boolean;
};

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
      <Text.Headline as="h3">
        Configure Confluent Cloud Destination
      </Text.Headline>

      <TextField
        errors={JSON.parse(bootstrapServerMeta.error || '{}')}
        name={bootstrapServerField.name}
        isRequired={true}
        onBlur={() => {
          bootstrapServerHelpers.setTouched(true);
        }}
        onChange={(event) => {
          bootstrapServerHelpers.setValue(event.target.value);
        }}
        title={
          <FormattedMessage
            {...messages.destinationConfluentCloudBootstrapServer}
            values={{
              cluster: '<xxxxx>',
              region: '<region>',
              provider: '<provider>',
            }}
          />
        }
        touched={bootstrapServerMeta.touched}
        value={bootstrapServerMeta.value || ''}
        isReadOnly={isReadOnly}
      />
      <TextField
        errors={JSON.parse(apiKeyMeta.error || '{}')}
        name={apiKeyField.name}
        isRequired={true}
        onBlur={() => {
          apiKeyHelpers.setTouched(true);
        }}
        onChange={(event) => {
          apiKeyHelpers.setValue(event.target.value);
        }}
        title={
          <FormattedMessage {...messages.destinationConfluentCloudApiKey} />
        }
        touched={apiKeyMeta.touched}
        value={apiKeyMeta.value || ''}
        isReadOnly={isReadOnly}
      />

      <TextField
        errors={JSON.parse(apiSecretMeta.error || '{}')}
        name={apiSecretField.name}
        isRequired={true}
        onBlur={() => {
          apiSecretHelpers.setTouched(true);
        }}
        onChange={(event) => {
          apiSecretHelpers.setValue(event.target.value);
        }}
        title={
          <FormattedMessage {...messages.destinationConfluentCloudApiSecret} />
        }
        touched={apiSecretMeta.touched}
        value={apiSecretMeta.value || ''}
        isReadOnly={isReadOnly}
      />
      <SelectField
        errors={JSON.parse(acksMeta.error || '{}')}
        name={acksField.name}
        options={[
          {
            value: '0',
            label: '0',
          },
          {
            value: '1',
            label: '1',
          },
          {
            value: 'all',
            label: 'all',
          },
        ]}
        isRequired={true}
        onBlur={() => {
          acksHelpers.setTouched(true);
        }}
        onChange={(event) => {
          acksHelpers.setValue(event.target.value as string);
        }}
        title={<FormattedMessage {...messages.destinationConfluentCloudAcks} />}
        touched={acksMeta.touched}
        value={acksMeta.value || ''}
        isReadOnly={isReadOnly}
      />
      <TextField
        errors={JSON.parse(topicMeta.error || '{}')}
        name={topicField.name}
        isRequired={true}
        onBlur={() => {
          topicHelpers.setTouched(true);
        }}
        onChange={(event) => {
          topicHelpers.setValue(event.target.value);
        }}
        title={
          <FormattedMessage {...messages.destinationConfluentCloudTopic} />
        }
        touched={topicMeta.touched}
        value={topicMeta.value || ''}
        isReadOnly={isReadOnly}
      />
    </>
  );
};
export default ConfluentCloudDestination;
