import { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import { PageNotFound } from '@commercetools-frontend/application-components';
import {
  Alert,
  Button,
  Flex,
  LoadingSpinner,
  ModalPage,
} from '@commercetools/nimbus';
import messages from './messages';
import CustomObjectForm, {
  TFormValues,
} from '../custom-object-form/custom-object-form';
import formMessages from '../custom-object-form/messages';
import {
  customObjectToFormValues,
  formValuesToTCustomObject,
} from '../custom-object-form/conversion';
import {
  getErrorMessage,
  graphQLErrorHandler,
  useCustomObjectDeleter,
  useCustomObjectFetcher,
  useCustomObjectCreatorOrUpdater,
} from '../../../hooks';

type Props = {
  onClose: () => Promise<void>;
  onIdChange: (id: string) => Promise<void>;
};

const CustomObjectEdit: FC<Props> = ({ onClose, onIdChange }) => {
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const { id } = useParams<{ id: string }>();
  const showNotification = useShowNotification();
  const customObjectUpdater = useCustomObjectCreatorOrUpdater();
  const customObjectDeleter = useCustomObjectDeleter();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { customObject, error, loading, refetch } = useCustomObjectFetcher({
    id: id,
  });

  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      const data = formValuesToTCustomObject(formikValues);
      if (customObject) {
        await customObjectUpdater
          .execute({
            draft: data,
          })
          .then(async ({ createOrUpdateCustomObject }) => {
            showNotification({
              kind: 'success',
              domain: DOMAINS.SIDE,
              text: intl.formatMessage(messages.updateSuccess),
            });
            if (createOrUpdateCustomObject?.id === customObject.id) {
              await refetch();
            } else {
              await onIdChange(createOrUpdateCustomObject?.id || '');
            }
          })
          .catch(graphQLErrorHandler(showNotification, formikHelpers));
      }
    },
    [refetch, customObject, customObjectUpdater]
  );

  const handleDelete = async () => {
    if (customObject) {
      await customObjectDeleter
        .execute({
          id: customObject.id,
          version: customObject.version,
        })
        .then(() => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.updateSuccess),
          });
          return onClose();
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
  if (!customObject) {
    return <PageNotFound />;
  }

  return (
    <CustomObjectForm
      initialValues={customObjectToFormValues(customObject)}
      onSubmit={handleSubmit}
      dataLocale={dataLocale}
      version={customObject.version}
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
    </CustomObjectForm>
  );
};

CustomObjectEdit.displayName = 'CustomObjectEdit';

export default CustomObjectEdit;
