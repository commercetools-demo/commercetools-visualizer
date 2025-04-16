import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import { DOMAINS } from '@commercetools-frontend/constants';
import messages from './messages';
import { FormModalPage } from '@commercetools-frontend/application-components';
import StatesForm, { TFormValues } from '../states-form/states-form';
import {
  formValuesToState,
  stateToFormValues,
} from '../states-form/conversion';
import {
  useStateCreator,
  graphQLErrorHandler,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { useParams } from 'react-router-dom';
import { TStateType } from '../../../types/generated/ctp';

type Props = {
  onClose: () => void;
  onCreate: (id: string) => void;
};
const StatesCreate: FC<Props> = ({ onClose, onCreate }) => {
  const intl = useIntl();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const { type } = useParams<{ type: string }>();
  const showNotification = useShowNotification();
  const stateCreator = useStateCreator();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      const draft = formValuesToState(formikValues);
      await stateCreator
        .execute({
          draft: draft,
        })
        .then(({ createState }) => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.createSuccess),
          });
          createState?.id && onCreate(createState?.id);
        })
        .catch(graphQLErrorHandler(showNotification, formikHelpers));
    },
    [stateCreator]
  );

  const newType = Object.keys(TStateType).find(
    (value) => value.toLocaleLowerCase() === type.toLocaleLowerCase()
  );

  return (
    <StatesForm
      initialValues={stateToFormValues(projectLanguages, {
        type: newType as TStateType,
      })}
      onSubmit={handleSubmit}
      createNewMode={true}
    >
      {(formProps) => {
        return (
          <FormModalPage
            title={intl.formatMessage(messages.title)}
            isOpen
            onPrimaryButtonClick={() => formProps.submitForm()}
            onSecondaryButtonClick={onClose}
            onClose={onClose}
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
    </StatesForm>
  );
};
export default StatesCreate;
