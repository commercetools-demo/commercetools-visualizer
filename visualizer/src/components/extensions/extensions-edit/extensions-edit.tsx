import { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  Alert,
  Button,
  Flex,
  LoadingSpinner,
  ModalPage,
} from '@commercetools/nimbus';
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
import {
  calculateExtensionsUpdateActions,
  getErrorMessage,
  graphQLErrorHandler,
  useExtensionDeleter,
  useExtensionFetcher,
  useExtensionUpdater,
} from '../../../hooks';

type Props = {
  onClose: () => void;
};

const ExtensionsEdit: FC<Props> = ({ onClose }) => {
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const { id } = useParams<{ id: string }>();
  const showNotification = useShowNotification();
  const extensionsUpdater = useExtensionUpdater();
  const extensionDeleter = useExtensionDeleter();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { extension, error, loading, refetch } = useExtensionFetcher({
    id: id,
  });

  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      const data = formValuesToTExtension(formikValues);
      if (extension) {
        const updateActions = calculateExtensionsUpdateActions(extension, data);
        if (updateActions.length > 0) {
          await extensionsUpdater
            .execute({
              id: extension.id,
              version: extension.version,
              actions: updateActions,
            })
            .then(() => {
              showNotification({
                kind: 'success',
                domain: DOMAINS.SIDE,
                text: intl.formatMessage(messages.updateSuccess),
              });
              return refetch();
            })
            .catch(graphQLErrorHandler(showNotification, formikHelpers));
        }
      }
    },
    [intl, refetch, showNotification, extension, extensionsUpdater]
  );

  const handleDelete = async () => {
    if (extension) {
      await extensionDeleter
        .execute({
          id: extension.id,
          version: extension.version,
        })
        .then(() => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.updateSuccess),
          });
          onClose();
        })
        .catch(graphQLErrorHandler(showNotification));
    }
  };

  if (error) {
    return (
      <Alert.Root colorPalette="critical">
        <Alert.Title>{intl.formatMessage(messages.title)}</Alert.Title>
        <Alert.Description>{getErrorMessage(error)}</Alert.Description>
      </Alert.Root>
    );
  }
  if (loading) {
    return (
      <Flex justifyContent="center" padding="600">
        <LoadingSpinner aria-label={intl.formatMessage(messages.title)} />
      </Flex>
    );
  }
  if (!extension) {
    return <PageNotFound />;
  }

  return (
    <ExtensionsForm
      initialValues={tExtensionToFormValues(extension)}
      onSubmit={handleSubmit}
      dataLocale={dataLocale}
      version={extension.version}
      refetch={refetch}
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
              variant="outline"
              isDisabled={!formProps.isDirty}
              onPress={formProps.handleReset}
            >
              {intl.formatMessage(formMessages.revertButton)}
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
            <Button
              colorPalette="critical"
              variant="outline"
              isDisabled={!canManage}
              onPress={() => handleDelete()}
            >
              {intl.formatMessage(formMessages.deleteButton)}
            </Button>
          </ModalPage.Footer>
        </ModalPage.Root>
      )}
    </ExtensionsForm>
  );
};

export default ExtensionsEdit;
