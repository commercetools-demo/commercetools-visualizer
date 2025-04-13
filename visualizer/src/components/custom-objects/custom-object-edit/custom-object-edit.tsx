import { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import messages from './messages';
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
import CustomObjectForm, {
  TFormValues,
} from '../custom-object-form/custom-object-form';
import {
  customObjectToFormValues,
  formValuesToTCustomObject,
} from '../custom-object-form/conversion';
import {
  graphQLErrorHandler,
  useCustomObjectDeleter,
  useCustomObjectFetcher,
  useCustomObjectUpdater,
} from 'commercetools-demo-shared-data-fetching-hooks';

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
  const customObjectUpdater = useCustomObjectUpdater();
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
          .then(async ({ data }) => {
            showNotification({
              kind: 'success',
              domain: DOMAINS.SIDE,
              text: intl.formatMessage(messages.updateSuccess),
            });
            if (data?.createOrUpdateCustomObject?.id === customObject.id) {
              await refetch();
            } else {
              await onIdChange(data?.createOrUpdateCustomObject?.id || '');
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
            {customObject && formProps.formElements}
          </CustomFormModalPage>
        );
      }}
    </CustomObjectForm>
  );
};
export default CustomObjectEdit;
