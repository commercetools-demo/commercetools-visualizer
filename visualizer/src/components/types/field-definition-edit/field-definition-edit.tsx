import { FC, SyntheticEvent, useCallback } from 'react';
import { useIntl } from 'react-intl';
import {
  CustomFormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { RevertIcon } from '@commercetools-uikit/icons';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import { PERMISSIONS } from '../../../constants';
import messages from '../field-definition-input/messages';
import FieldDefinitionInput from '../field-definition-input/field-definition-input';
import {
  fromFormValuesToTFieldDefinitionInput,
  initialValuesFromFieldDefinition,
  TFormValues,
} from '../field-definition-input/helpers';
import {
  useTypeWithDefinitionByNameFetcher,
  graphQLErrorHandler,
  useTypeDefinitionUpdater,
  getErrorMessage,
} from 'commercetools-demo-shared-data-fetching-hooks';

type Props = {
  onClose: (event: SyntheticEvent) => void;
};

const FieldDefinitionEdit: FC<Props> = ({ onClose }) => {
  const { id, fieldDefinitionName } = useParams<{
    id: string;
    fieldDefinitionName: string;
  }>();
  const showNotification = useShowNotification();

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const intl = useIntl();

  const typeDefinitionUpdater = useTypeDefinitionUpdater();

  const { fieldDefinitions, error, loading, version, refetch } =
    useTypeWithDefinitionByNameFetcher({
      id: id,
      includeNames: [fieldDefinitionName],
    });

  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      const fieldDefinitionInput =
        fromFormValuesToTFieldDefinitionInput(formikValues);
      if (fieldDefinitions) {
        await typeDefinitionUpdater
          .execute({
            originalDraft: fieldDefinitions[0],
            nextDraft: fieldDefinitionInput,
            id: id,
            version: version || 1,
          })
          .then(async () => {
            await refetch();
            showNotification({
              kind: 'success',
              domain: DOMAINS.SIDE,
              text: intl.formatMessage(messages.fieldDefinitionUpdated, {}),
            });
          })
          .catch(graphQLErrorHandler(showNotification, formikHelpers));
      }
    },
    [fieldDefinitions, id, intl, refetch, typeDefinitionUpdater, version]
  );

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
  if (!fieldDefinitions || fieldDefinitions.length < 1) {
    return <PageNotFound />;
  }

  return (
    <FieldDefinitionInput
      initialValues={initialValuesFromFieldDefinition(
        fieldDefinitions[0],
        projectLanguages
      )}
      onSubmit={handleSubmit}
      dataLocale={dataLocale}
    >
      {(formProps) => {
        return (
          <CustomFormModalPage
            isOpen
            onClose={onClose}
            title={intl.formatMessage(messages.modalTitle)}
            //subtitle={<LabelRequired />}
            topBarCurrentPathLabel={intl.formatMessage(messages.modalTitle)}
            formControls={
              <>
                <CustomFormModalPage.FormSecondaryButton
                  label={intl.formatMessage(messages.revert)}
                  iconLeft={<RevertIcon />}
                  onClick={onClose}
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                />
                <CustomFormModalPage.FormPrimaryButton
                  label={messages.updateButton}
                  onClick={() => formProps.submitForm()}
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                />
              </>
            }
          >
            {fieldDefinitions && formProps.formElements}
          </CustomFormModalPage>
        );
      }}
    </FieldDefinitionInput>
  );
};

FieldDefinitionEdit.displayName = 'FieldDefinitionInput';

export default FieldDefinitionEdit;
