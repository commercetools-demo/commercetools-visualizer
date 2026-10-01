import { defineMessages } from 'react-intl';

export default defineMessages({
  description: {
    id: 'ExtensionsExpansionPathsForm.description',
    description: 'Explains expansion paths and their limit',
    defaultMessage:
      'References expanded in the payload sent to the extension, for example "lineItems[*].variant". At most {max} paths.',
  },
  pathLabel: {
    id: 'ExtensionsExpansionPathsForm.pathLabel',
    description: 'Label of one expansion path input',
    defaultMessage: 'Expansion path {index}',
  },
  addPath: {
    id: 'ExtensionsExpansionPathsForm.addPath',
    description: 'Button adding an expansion path row',
    defaultMessage: 'Add expansion path',
  },
  removePath: {
    id: 'ExtensionsExpansionPathsForm.removePath',
    description: 'Button removing an expansion path row',
    defaultMessage: 'Remove expansion path {index}',
  },
  errorTooMany: {
    id: 'ExtensionsExpansionPathsForm.errorTooMany',
    description: 'Validation error when too many paths are entered',
    defaultMessage: 'A maximum of {max} expansion paths is allowed.',
  },
  errorDuplicate: {
    id: 'ExtensionsExpansionPathsForm.errorDuplicate',
    description: 'Validation error for a repeated path',
    defaultMessage: 'Each expansion path may only be used once.',
  },
});
