import { FC } from 'react';
import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { FormField, Heading, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import { validateInput } from './validate';

type Props = {
  isReadOnly?: boolean;
};

const EventBridgeDestination: FC<Props> = ({ isReadOnly }) => {
  const [accountIdField, accountIdMeta, accountIdHelpers] = useField<string>({
    name: 'destination.EventBridge.accountId',
    validate: validateInput,
  });
  const [regionField, regionMeta, regionHelpers] = useField<string>({
    name: 'destination.EventBridge.region',
    validate: validateInput,
  });
  return (
    <>
      <Heading as="h3" size="sm">
        <FormattedMessage {...messages.configureEventBridgeHeading} />
      </Heading>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(accountIdMeta.touched && accountIdMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationEventBridgeAccountId} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={accountIdField.name}
            value={accountIdMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => accountIdHelpers.setTouched(true)}
            onChange={(value) => accountIdHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {accountIdMeta.touched && accountIdMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(regionMeta.touched && regionMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationEventBridgeRegion} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={regionField.name}
            value={regionMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => regionHelpers.setTouched(true)}
            onChange={(value) => regionHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {regionMeta.touched && regionMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
    </>
  );
};

export default EventBridgeDestination;
