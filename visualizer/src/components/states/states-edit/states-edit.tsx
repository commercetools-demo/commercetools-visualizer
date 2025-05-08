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
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import StatesForm, { TFormValues } from '../states-form/states-form';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import {
  useStateDeleter,
  useStateFetcher,
  useStateUpdater,
  graphQLErrorHandler,
  getErrorMessage,
  calculateStateUpdateActions,
} from 'commercetools-demo-shared-data-fetching-hooks';
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
      const data = formValuesToState(formikValues);
      if (state && data) {
        const updateActions = calculateStateUpdateActions(state, data);
        if (updateActions.length > 0) {
          await stateUpdater
            .execute({
              id: state.id,
              version: state.version,
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
    [refetch, state]
  );

  const handleDelete = async () => {
    await stateDeleter
      .execute({
        id: state?.id,
        version: state?.version || 1,
      })
      .then(() => {
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.stateDeleted),
        });
        onClose();
      })
      .catch(graphQLErrorHandler(showNotification));
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
                  isDisabled={!canManage}
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
