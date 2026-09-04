import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import { ComboBox, FormField } from '@commercetools/nimbus';
import { useField } from 'formik';
import { FC } from 'react';

export const validateKeyInput = (key: string) => {
  const hasKeyValue = Boolean(key);
  if (!hasKeyValue) {
    return JSON.stringify({ missing: true });
  }
  return undefined;
};

type Props = { isReadOnly?: boolean };

const SubscriptionDestinationTypeForm: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();
  const [keyField, keyMeta, keyHelpers] = useField<string>({
    name: 'destinationType',
    validate: validateKeyInput,
  });

  const options = [
    {
      id: 'EventBridge',
      label: intl.formatMessage(messages.destinationAWSEventBridge),
    },
    { id: 'sns', label: intl.formatMessage(messages.destinationSNS) },
    { id: 'SQS', label: intl.formatMessage(messages.destinationSQS) },
    {
      id: 'AzureEventGrid',
      label: intl.formatMessage(messages.destinationAzureEventGrid),
    },
    {
      id: 'AzureServiceBus',
      label: intl.formatMessage(messages.destinationAzureServiceBus),
    },
    {
      id: 'GoogleCloudPubSub',
      label: intl.formatMessage(messages.destinationGoogleCloudPubSub),
    },
    {
      id: 'ConfluentCloud',
      label: intl.formatMessage(messages.destinationConfluentCloud),
    },
  ];

  return (
    <FormField.Root
      isRequired
      isReadOnly={isReadOnly}
      isInvalid={Boolean(keyMeta.touched && keyMeta.error)}
    >
      <FormField.Label>
        <FormattedMessage {...messages.destinationLabel} />
      </FormField.Label>
      <FormField.Description>
        <FormattedMessage {...messages.destinationDescription} />
      </FormField.Description>
      <FormField.Input>
        <ComboBox.Root
          name={keyField.name}
          aria-label={intl.formatMessage(messages.destinationLabel)}
          items={options}
          selectionMode="single"
          isReadOnly={isReadOnly}
          selectedKeys={keyMeta.value ? [keyMeta.value] : []}
          onSelectionChange={(keys) => {
            const [selected] = Array.from(keys as Iterable<string>);
            keyHelpers.setValue(selected ?? '');
          }}
          onBlur={() => keyHelpers.setTouched(true)}
          width={'full'}
        >
          <ComboBox.Trigger />
          <ComboBox.Popover>
            <ComboBox.ListBox>
              {(item: { id: string; label: string }) => (
                <ComboBox.Option id={item.id}>{item.label}</ComboBox.Option>
              )}
            </ComboBox.ListBox>
          </ComboBox.Popover>
        </ComboBox.Root>
      </FormField.Input>
      <FormField.Error>
        {keyMeta.touched && keyMeta.error ? (
          <FormattedMessage {...messages.destinationRequired} />
        ) : null}
      </FormField.Error>
    </FormField.Root>
  );
};

export default SubscriptionDestinationTypeForm;
