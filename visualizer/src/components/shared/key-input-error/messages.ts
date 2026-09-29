import { defineMessages } from 'react-intl';

export default defineMessages({
  requiredKey: {
    id: 'Shared.KeyInputError.requiredKey',
    description: 'The message shown when a required key is not provided',
    defaultMessage: 'This field is required. Provide at least one value.',
  },
  invalidKey: {
    id: 'Shared.KeyInputError.invalidKey',
    description: 'The message shown when a key has invalid characters',
    defaultMessage:
      'Key must contain between 2 and 256 alphanumeric characters, underscores and/or hyphens',
  },
  duplicateKey: {
    id: 'Shared.KeyInputError.duplicateKey',
    description: 'The message shown when a key already exists',
    defaultMessage: 'A {resource} with this key already exists.',
  },
  keyHint: {
    id: 'Shared.KeyInputError.keyHint',
    description: 'Hint describing the allowed key format',
    defaultMessage:
      'May only contain between 2 and 256 alphanumeric characters, underscores, or hyphens (no spaces or special characters like ñ, ü, #, %).',
  },
  resourceType: {
    id: 'Shared.KeyInputError.resourceType',
    description:
      'The resource noun slotted into duplicateKey for a Type, e.g. "A {resource} with this key already exists."',
    defaultMessage: 'type',
  },
  resourceState: {
    id: 'Shared.KeyInputError.resourceState',
    description:
      'The resource noun slotted into duplicateKey for a State, e.g. "A {resource} with this key already exists."',
    defaultMessage: 'state',
  },
  resourceExtension: {
    id: 'Shared.KeyInputError.resourceExtension',
    description:
      'The resource noun slotted into duplicateKey for an Extension, e.g. "A {resource} with this key already exists."',
    defaultMessage: 'extension',
  },
  resourceSubscription: {
    id: 'Shared.KeyInputError.resourceSubscription',
    description:
      'The resource noun slotted into duplicateKey for a Subscription, e.g. "A {resource} with this key already exists."',
    defaultMessage: 'subscription',
  },
  resourceCustomObject: {
    id: 'Shared.KeyInputError.resourceCustomObject',
    description:
      'The resource noun slotted into duplicateKey for a Custom Object, e.g. "A {resource} with this key already exists."',
    defaultMessage: 'custom object',
  },
  resourceField: {
    id: 'Shared.KeyInputError.resourceField',
    description:
      'The resource noun slotted into duplicateKey for a field definition, e.g. "A {resource} with this key already exists."',
    defaultMessage: 'field',
  },
});
