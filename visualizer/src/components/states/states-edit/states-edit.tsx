import { FC, useCallback } from 'react';
import { PageNotFound } from '@commercetools-frontend/application-components';
import messages from './messages';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useParams } from 'react-router-dom';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import {
  Alert,
  Button,
  Flex,
  LoadingSpinner,
  ModalPage,
} from '@commercetools/nimbus';
import StatesForm, { TFormValues } from '../states-form/states-form';
import formMessages from '../states-form/messages';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import {
  useStateDeleter,
  useStateFetcher,
  useStateUpdater,
  graphQLErrorHandler,
  getErrorMessage,
  calculateStateUpdateActions,
} from '../../../hooks';
import {
  formValuesToStatePartial,
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
      const data = formValuesToStatePartial(formikValues);
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
  if (!state) {
    return <PageNotFound />;
  }
  return (
    <StatesForm
      initialValues={stateToFormValues(projectLanguages, state)}
      onSubmit={handleSubmit}
      createNewMode={!(state?.builtIn && state?.builtIn === true)}
    >
      {(formProps) => (
        <ModalPage.Root isOpen onClose={onClose}>
          <ModalPage.TopBar
            previousPathLabel={intl.formatMessage(formMessages.cancelButton)}
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
    </StatesForm>
  );
};

export default StatesEdit;
