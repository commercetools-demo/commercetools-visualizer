import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import { DOMAINS } from '@commercetools-frontend/constants';
import messages from './messages';
import { transformErrors } from '../../subscriptions/transform-errors';
import { FormModalPage } from '@commercetools-frontend/application-components';
import StatesForm, { TFormValues } from '../states-form/states-form';
import {
  formValuesToState,
  stateToFormValues,
} from '../states-form/conversion';
import { useStateCreator } from '../../../hooks/use-states-hook';

type Props = {
  onClose: () => void;
  onCreate: (id: string) => void;
};
const StatesCreate: FC<Props> = ({ onClose, onCreate }) => {
  const intl = useIntl();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const showNotification = useShowNotification();
  const stateCreator = useStateCreator();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      try {
        const draft = formValuesToState(formikValues);
        const result = await stateCreator.execute({
          draft: draft,
        });
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.createSuccess),
        });
        result.data?.createTypeDefinition?.id &&
          onCreate(result.data?.createTypeDefinition?.id);
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
    [intl, stateCreator]
  );

  return (
    <StatesForm
      initialValues={stateToFormValues(projectLanguages)}
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
