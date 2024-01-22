import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'CreateType.title',
    description: 'The page title of create type',
    defaultMessage: 'Create a type',
  },
  backButton: {
    id: 'CreateType.button.back',
    description: 'Label for back button',
    defaultMessage: 'To Types list',
  },
  createSuccess: {
    id: 'CreateType.form.message.success',
    description: 'Success message for create type',
    defaultMessage: 'Your custom type has been created.',
  },
  createError: {
    id: 'CreateType.message.create.error',
    description: 'Error message for creating type',
    defaultMessage: 'Something went wrong. The type was not created. {message}',
  },
});
