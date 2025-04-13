import { FC, useCallback } from 'react';
import { FormModalPage } from '@commercetools-frontend/application-components';
import messages from '../../types/types-create/messages';
import ExtensionsForm, {
  TFormValues,
} from '../extensions-form/extensions-form';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import {
  useExtensionCreator,
  graphQLErrorHandler,
} from 'commercetools-demo-shared-data-fetching-hooks';
import {
  formValuesToTExtension,
  tExtensionToFormValues,
} from '../extensions-form/conversion';

type Props = {
  onClose: () => void;
};

const ExtensionsCreate: FC<Props> = ({ onClose }) => {
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const extensionCreator = useExtensionCreator();
  const showNotification = useShowNotification();
  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      const draft = formValuesToTExtension(formikValues);
      await extensionCreator
        .execute({
          draft: draft,
        })
        .then(() => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.createSuccess),
          });
        })
        .catch(graphQLErrorHandler(showNotification, formikHelpers));
    },
    [extensionCreator]
  );
  return (
    <ExtensionsForm
      initialValues={tExtensionToFormValues()}
      onSubmit={handleSubmit}
      dataLocale={dataLocale}
      version={-1}
      createNewMode={true}
    >
      {(formProps) => {
        return (
          <FormModalPage
            title={intl.formatMessage(messages.title)}
            isOpen
            onPrimaryButtonClick={() => formProps.submitForm()}
            onSecondaryButtonClick={onClose}
            hideControls={false}
            labelPrimaryButton={intl.formatMessage(FormModalPage.Intl.save)}
            isPrimaryButtonDisabled={
              formProps.isSubmitting || !formProps.isDirty || !canManage
            }
          >
            {formProps.formElements}
          </FormModalPage>
        );
      }}
    </ExtensionsForm>
  );
};
export default ExtensionsCreate;
