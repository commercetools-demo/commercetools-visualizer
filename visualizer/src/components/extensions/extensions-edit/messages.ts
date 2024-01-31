import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'EditExtensions.title',
    description: 'The page title of create type',
    defaultMessage: 'Edit Extension',
  },
  backButton: {
    id: 'EditExtensions.button.back',
    description: 'Label for back button',
    defaultMessage: 'To Extensions list',
  },
  createSuccess: {
    id: 'EditExtensions.form.message.success',
    description: 'Success message for create type',
    defaultMessage: 'Your Extension has been saved.',
  },
  createError: {
    id: 'EditExtensions.message.create.error',
    description: 'Error message for creating type',
    defaultMessage:
      'Something went wrong. The Extension was not saved. {message}',
  },
  updateSuccess: {
    id: 'EditExtensions.form.message.update.success',
    description: 'Success message for update type',
    defaultMessage: 'Your Extension has been updated.',
  },
});
