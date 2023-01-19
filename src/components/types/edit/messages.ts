import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'EditType.title',
    description: 'The page title of create type',
    defaultMessage: 'Edit Type',
  },
  backButton: {
    id: 'EditType.button.back',
    description: 'Label for back button',
    defaultMessage: 'To Types list',
  },
  createSuccess: {
    id: 'EditType.form.message.success',
    description: 'Success message for create type',
    defaultMessage: 'Your Type has been saved.',
  },
  createError: {
    id: 'EditType.message.create.error',
    description: 'Error message for creating type',
    defaultMessage: 'Something went wrong. The Type was not saved. {message}',
  },
  updateSuccess: {
    id: 'EditType.form.message.update.success',
    description: 'Success message for update type',
    defaultMessage: 'Your Type has been updated.',
  },
});
