import { FC, useCallback } from 'react';
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
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import {
  showNotification,
  showApiErrorNotification,
  TApiErrorNotificationOptions,
} from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import {
  useTypeDefinitionUpdater,
  useTypeWithDefinitionByNameFetcher,
} from '../type-definition-connectors';
import { getErrorMessage } from '../../../helpers';
import { PERMISSIONS } from '../../../constants';
import { transformErrors } from '../../subscriptions/transform-errors';
import messages from './messages';
import FieldDefinitionInputForm from './FieldDefinitionInputForm';

type Props = {
  isOpen?: boolean;
  onSubmit?: (values: any) => void;
  onClose: (event: any) => void;
  existingFieldDefinition?: any;
};

const FieldDefinitionInput: FC<Props> = (props) => {
  const { id, fieldDefinitionName } = useParams<{
    id: string;
    fieldDefinitionName: string;
  }>();

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
    useTypeWithDefinitionByNameFetcher(id, [fieldDefinitionName]);

  const handleSubmit = useCallback(
    async (formikValues, formikHelpers) => {
      try {
        const data = {
          fieldDefinitions: [
            {
              name: formikValues.name,
              label: LocalizedTextInput.omitEmptyTranslations(
                formikValues.label
              ),
            },
          ],
        };
        if (fieldDefinitions) {
          await typeDefinitionUpdater.execute({
            originalDraft: {
              id: id,
              fieldDefinitions: [fieldDefinitions[0]],
              version: version,
            },
            nextDraft: data,
          });
        }
        refetch();
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.fieldDefinitionUpdated, {}),
        });
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
  if (!fieldDefinitions) {
    return <PageNotFound />;
  }

  return (
    <FieldDefinitionInputForm
      initialValues={{
        label: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString(
            fieldDefinitions[0].labelAllLocales ?? []
          ) ?? {}
        ),
        name: fieldDefinitions[0].name,
        inputHint: fieldDefinitions[0].inputHint || 'SingleLine',
        type: { name: fieldDefinitions[0].type.name, referenceTypeId: '' },
      }}
      onSubmit={handleSubmit}
      dataLocale={dataLocale}
    >
      {(formProps) => {
        return (
          <CustomFormModalPage
            isOpen
            onClose={props.onClose}
            title={intl.formatMessage(messages.modalTitle)}
            //subtitle={<LabelRequired />}
            topBarCurrentPathLabel={intl.formatMessage(messages.modalTitle)}
            formControls={
              <>
                <CustomFormModalPage.FormSecondaryButton
                  label={intl.formatMessage(messages.revert)}
                  iconLeft={<RevertIcon />}
                  onClick={props.onClose}
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
    </FieldDefinitionInputForm>
  );
};

FieldDefinitionInput.displayName = 'FieldDefinitionInput';

export default FieldDefinitionInput;
