import { FC, useCallback } from 'react';
import { FormModalPage } from '@commercetools-frontend/application-components';
import messages from './messages';
import CustomObjectForm, {
  TFormValues,
} from '../custom-object-form/custom-object-form';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import {
  formValuesToTCustomObject,
  customObjectToFormValues,
} from '../custom-object-form/conversion';
import { graphQLErrorHandler } from '../../../utils/error-handling';
import { useCustomObjectUpdater } from '../../../hooks/use-custom-object-connector';

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
  const extensionCreator = useCustomObjectUpdater();
  const showNotification = useShowNotification();
  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      const draft = formValuesToTCustomObject(formikValues);
      await extensionCreator
        .execute({
          draft: draft,
        })
        .then(({ data }) => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.createSuccess),
          });
          return onSuccess(data?.createOrUpdateCustomObject?.id || '');
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
    </CustomObjectForm>
  );
};
export default CustomObjectCreate;
