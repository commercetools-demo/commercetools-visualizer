import { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useIntl } from 'react-intl';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import messages from './messages';
import { transformErrors } from '../../subscriptions/transform-errors';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  CustomFormDetailPage,
  CustomFormModalPage,
  FormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import ExtensionsForm, {
  TFormValues,
} from '../extensions-form/extensions-form';
import {
  formValuesToTExtension,
  tExtensionToFormValues,
} from '../extensions-form/conversion';
import {
  useExtensionDeleter,
  useExtensionFetcher,
  useExtensionUpdater,
} from '../../../hooks/use-extensions-connector';

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
      try {
        const data = formValuesToTExtension(formikValues);
        if (extension) {
          await extensionsUpdater.execute({
            originalDraft: extension,
            nextDraft: data,
            id: extension.id,
            version: extension.version,
          });
        }
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.updateSuccess),
        });
        refetch();
      } catch (graphQLErrors) {
        const transformedErrors = transformErrors(graphQLErrors);
        if (transformedErrors.unmappedErrors.length > 0) {
          showApiErrorNotification({
            errors:
              transformedErrors.unmappedErrors as TApiErrorNotificationOptions['errors'],
          });
        }

        formikHelpers.setErrors(transformedErrors.formErrors);
      }
    },
    [intl, refetch, showNotification, extension, extensionsUpdater]
  );

  const handleDelete = async () => {
    if (extension) {
      await extensionDeleter.execute({
        id: extension.id,
        version: extension.version,
      });
      showNotification({
        kind: 'success',
        domain: DOMAINS.SIDE,
        text: intl.formatMessage(messages.updateSuccess),
      });
      onClose();
    }
  };

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
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
      {(formProps) => {
        return (
          <CustomFormModalPage
            isOpen
            title={intl.formatMessage(messages.title)}
            onClose={onClose}
            formControls={
              <>
                <CustomFormDetailPage.FormSecondaryButton
                  label={FormModalPage.Intl.revert}
                  isDisabled={!formProps.isDirty}
                  onClick={formProps.handleReset}
                />
                <CustomFormDetailPage.FormPrimaryButton
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                  onClick={() => formProps.submitForm()}
                  label={FormModalPage.Intl.save}
                />
                <CustomFormModalPage.FormDeleteButton
                  onClick={() => handleDelete()}
                />
              </>
            }
          >
            {extension && formProps.formElements}
          </CustomFormModalPage>
        );
      }}
    </ExtensionsForm>
  );
};
export default ExtensionsEdit;
