import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { Button, ModalPage } from '@commercetools/nimbus';
import { PERMISSIONS } from '../../../constants';
import messages from './messages';
import CustomObjectForm, {
  TFormValues,
} from '../custom-object-form/custom-object-form';
import formMessages from '../custom-object-form/messages';
import {
  formValuesToTCustomObject,
  customObjectToFormValues,
} from '../custom-object-form/conversion';
import {
  graphQLErrorHandler,
  useCustomObjectCreatorOrUpdater,
} from '../../../hooks';
import { FormikHelpers } from 'formik';

type Props = {
  onClose: () => Promise<void>;
  onSuccess: (id: string) => Promise<void>;
};

const CustomObjectCreate: FC<Props> = ({ onClose, onSuccess }) => {
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const extensionCreator = useCustomObjectCreatorOrUpdater();
  const showNotification = useShowNotification();
  const handleSubmit = useCallback(
    async (
      formikValues: TFormValues,
      formikHelpers: FormikHelpers<TFormValues>
    ) => {
      const draft = formValuesToTCustomObject(formikValues);
      await extensionCreator
        .execute({
          draft: draft,
        })
        .then(({ createOrUpdateCustomObject }) => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.createSuccess),
          });
          return onSuccess(createOrUpdateCustomObject?.id || '');
        })
        .catch(graphQLErrorHandler(showNotification, formikHelpers));
    },
    [extensionCreator]
  );
  return (
    <CustomObjectForm
      initialValues={customObjectToFormValues()}
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
    </CustomObjectForm>
  );
};

CustomObjectCreate.displayName = 'CustomObjectCreate';

export default CustomObjectCreate;
