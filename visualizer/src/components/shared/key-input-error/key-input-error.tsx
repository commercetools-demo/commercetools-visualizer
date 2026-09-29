import { ReactNode } from 'react';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import { TKeyValidationError } from '../../../utils/validate-key';
import messages from './messages';

export type TKeyInputError = TKeyValidationError & {
  duplicate?: boolean;
};

export type TKeyInputResourceType =
  | 'type'
  | 'state'
  | 'extension'
  | 'subscription'
  | 'customObject'
  | 'field';

const resourceMessages: Record<TKeyInputResourceType, MessageDescriptor> = {
  type: messages.resourceType,
  state: messages.resourceState,
  extension: messages.resourceExtension,
  subscription: messages.resourceSubscription,
  customObject: messages.resourceCustomObject,
  field: messages.resourceField,
};

type Props = {
  error?: TKeyInputError;
  resourceType: TKeyInputResourceType;
};

const KeyInputError = ({ error, resourceType }: Props): ReactNode => {
  const intl = useIntl();
  if (!error) return null;
  if (error.invalidInput) return <FormattedMessage {...messages.invalidKey} />;
  if (error.duplicate) {
    return (
      <FormattedMessage
        {...messages.duplicateKey}
        values={{
          resource: intl.formatMessage(resourceMessages[resourceType]),
        }}
      />
    );
  }
  if (error.missing) return <FormattedMessage {...messages.requiredKey} />;
  return null;
};

export default KeyInputError;
