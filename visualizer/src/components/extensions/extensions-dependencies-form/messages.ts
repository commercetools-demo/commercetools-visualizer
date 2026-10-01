import { defineMessages } from 'react-intl';

export default defineMessages({
  dependenciesDescription: {
    id: 'ExtensionsDependenciesForm.description',
    description: 'Explains what dependencies are and their restrictions',
    defaultMessage:
      'Extensions that must complete before this one runs (Extension Chaining). At most {max} direct dependencies, no circular dependencies and a chain of at most 3 layers. A dependency has to be triggered for every resource type and action this extension is triggered for.',
  },
  noOtherExtensions: {
    id: 'ExtensionsDependenciesForm.noOtherExtensions',
    description: 'Shown when the project has no other extensions',
    defaultMessage: 'There are no other extensions to depend on.',
  },
  loadError: {
    id: 'ExtensionsDependenciesForm.loadError',
    description: 'Shown when the other extensions could not be loaded',
    defaultMessage: 'The other extensions could not be loaded.',
  },
  reasonCircular: {
    id: 'ExtensionsDependenciesForm.reasonCircular',
    description: 'Why a dependency cannot be chosen',
    defaultMessage: 'Would create a circular dependency.',
  },
  reasonNotApplicable: {
    id: 'ExtensionsDependenciesForm.reasonNotApplicable',
    description: 'Why a dependency cannot be chosen',
    defaultMessage:
      'Not triggered for every resource type and action of this extension.',
  },
  reasonLimit: {
    id: 'ExtensionsDependenciesForm.reasonLimit',
    description: 'Why a dependency cannot be chosen',
    defaultMessage: 'A maximum of {max} dependencies is allowed.',
  },
  errorTooMany: {
    id: 'ExtensionsDependenciesForm.errorTooMany',
    description: 'Validation error when too many dependencies are selected',
    defaultMessage: 'A maximum of {max} dependencies is allowed.',
  },
  errorNotFound: {
    id: 'ExtensionsDependenciesForm.errorNotFound',
    description: 'Validation error for a dependency that no longer exists',
    defaultMessage: 'The extension {name} no longer exists.',
  },
});
