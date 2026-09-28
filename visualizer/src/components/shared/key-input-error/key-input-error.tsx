import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { TKeyValidationError } from '../../../utils/validate-key';
import messages from './messages';

export type TKeyInputError = TKeyValidationError & {
  duplicate?: boolean;
};

type Props = {
  error?: TKeyInputError;
  // The English noun to slot into "A {resource} with this key already
  // exists." — e.g. "type", "state", "subscription".
  resourceLabel: string;
};

const KeyInputError = ({ error, resourceLabel }: Props): ReactNode => {
  if (!error) return null;
  if (error.invalidInput) return <FormattedMessage {...messages.invalidKey} />;
  if (error.duplicate) {
    return (
      <FormattedMessage
        {...messages.duplicateKey}
        values={{ resource: resourceLabel }}
      />
    );
  }
  if (error.missing) return <FormattedMessage {...messages.requiredKey} />;
  return null;
};

export default KeyInputError;
