import { FC, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  Alert,
  Button,
  DefaultPage,
  Flex,
  Group,
  LoadingSpinner,
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
import { FormikHelpers } from 'formik';

type Props = {
  linkToWelcome: string;
};

const ExtensionsEdit: FC<Props> = ({ linkToWelcome }) => {
  const intl = useIntl();
  const history = useHistory();
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
    async (
      formikValues: TFormValues,
      formikHelpers: FormikHelpers<TFormValues>
    ) => {
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
            })
            .catch(graphQLErrorHandler(showNotification, formikHelpers));
        }
      }
    },
    [intl, showNotification, extension, extensionsUpdater]
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
          history.replace({
            pathname: linkToWelcome + '/extensions',
            state: { refetch: true },
          });
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
      extensionId={extension.id}
      refetch={refetch}
    >
      {(formProps) => (
        <DefaultPage.Root>
          <DefaultPage.Header>
            <DefaultPage.BackLink
              href="#"
              onClick={(event) => {
                event.preventDefault();
                history.push(linkToWelcome + '/extensions');
              }}
            >
              {intl.formatMessage(messages.backButton)}
            </DefaultPage.BackLink>
            <DefaultPage.Title>
              {formProps.values?.key || intl.formatMessage(messages.title)}
            </DefaultPage.Title>
          </DefaultPage.Header>
          <DefaultPage.Content>{formProps.formElements}</DefaultPage.Content>
          <DefaultPage.Footer>
            <Group
              aria-label={intl.formatMessage(messages.formActionsLabel)}
              gap="300"
            >
              <Button
                variant="solid"
                colorPalette="critical"
                isDisabled={!canManage}
                onPress={() => handleDelete()}
              >
                {intl.formatMessage(formMessages.deleteButton)}
              </Button>
              <Button
                variant="outline"
                isDisabled={!formProps.isDirty}
                onPress={formProps.handleReset}
              >
                {intl.formatMessage(formMessages.revertButton)}
              </Button>
              <Button
                variant="solid"
                colorPalette="primary"
                isDisabled={
                  formProps.isSubmitting || !formProps.isDirty || !canManage
                }
                onPress={() => formProps.submitForm()}
              >
                {intl.formatMessage(formMessages.submitButton)}
              </Button>
            </Group>
          </DefaultPage.Footer>
        </DefaultPage.Root>
      )}
    </ExtensionsForm>
  );
};

export default ExtensionsEdit;
