import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { Button, ModalPage } from '@commercetools/nimbus';
import { DOMAINS } from '@commercetools-frontend/constants';
import { PERMISSIONS } from '../../../constants';
import ExtensionsForm, {
  TFormValues,
} from '../extensions-form/extensions-form';
import {
  formValuesToTExtension,
  tExtensionToFormValues,
} from '../extensions-form/conversion';
import formMessages from '../extensions-form/messages';
import messages from './messages';
import { graphQLErrorHandler, useExtensionCreator } from '../../../hooks';

type Props = {
  onSuccess: (id: string) => Promise<void>;
  onClose: () => void;
};

const ExtensionsCreate: FC<Props> = ({ onClose, onSuccess }) => {
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
        .then(({ createExtension }) => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.createSuccess),
          });
          return onSuccess(createExtension?.id || '');
        })
        .catch(graphQLErrorHandler(showNotification, formikHelpers));
    },
    [extensionCreator, intl, onSuccess, showNotification]
  );

  return (
    <ExtensionsForm
      initialValues={tExtensionToFormValues()}
      onSubmit={handleSubmit}
      dataLocale={dataLocale}
      version={-1}
      createNewMode={true}
    >
      {(formProps) => (
        <ModalPage.Root isOpen onClose={onClose}>
          <ModalPage.TopBar
            previousPathLabel={intl.formatMessage(messages.backButton)}
            currentPathLabel={intl.formatMessage(messages.title)}
          />
          <ModalPage.Header>
            <ModalPage.Title>
              {intl.formatMessage(messages.title)}
            </ModalPage.Title>
          </ModalPage.Header>
          <ModalPage.Content>{formProps.formElements}</ModalPage.Content>
          <ModalPage.Footer>
            <Button slot="close" variant="outline" onPress={onClose}>
              {intl.formatMessage(formMessages.cancelButton)}
            </Button>
            <Button
              colorPalette="primary"
              variant="solid"
              isDisabled={
                formProps.isSubmitting || !formProps.isDirty || !canManage
              }
              onPress={() => formProps.submitForm()}
            >
              {intl.formatMessage(formMessages.submitButton)}
            </Button>
          </ModalPage.Footer>
        </ModalPage.Root>
      )}
    </ExtensionsForm>
  );
};

export default ExtensionsCreate;
