import { FC, useCallback } from 'react';
import {
  CustomFormDetailPage,
  CustomFormModalPage,
  FormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import messages from './messages';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useParams } from 'react-router-dom';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import StatesForm, { TFormValues } from '../states-form/states-form';
import { DOMAINS } from '@commercetools-frontend/constants';
import { transformErrors } from '../../subscriptions/transform-errors';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import {
  useStateDeleter,
  useStateFetcher,
  useStateUpdater,
} from '../../../hooks/use-states-hook';
import {
  formValuesToState,
  stateToFormValues,
} from '../states-form/conversion';

type Props = {
  onClose: () => void;
};

const StatesEdit: FC<Props> = ({ onClose }) => {
  const intl = useIntl();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const showNotification = useShowNotification();
  const { id } = useParams<{ id: string }>();
  const stateUpdater = useStateUpdater();
  const stateDeleter = useStateDeleter();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { state, error, loading, refetch } = useStateFetcher({
    id: id,
  });

  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      try {
        const data = formValuesToState(formikValues);
        if (state && data) {
          await stateUpdater.execute({
            originalDraft: state,
            nextDraft: data,
            id: state.id,
            version: state.version,
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
    [intl, refetch, showNotification, state]
  );

  const handleDelete = async () => {
    await stateDeleter.execute({
      id: state?.id,
      version: state?.version || 1,
    });
    showNotification({
      kind: 'success',
      domain: DOMAINS.SIDE,
      text: intl.formatMessage(messages.stateDeleted),
    });
    onClose();
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
  if (!state) {
    return <PageNotFound />;
  }
  return (
    <StatesForm
      initialValues={stateToFormValues(projectLanguages, state)}
      onSubmit={handleSubmit}
      createNewMode={!(state?.builtIn && state?.builtIn === true)}
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
            {state && formProps.formElements}
          </CustomFormModalPage>
        );
      }}
    </StatesForm>
  );
};

export default StatesEdit;
