import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { CustomFormModalPage } from '@commercetools-frontend/application-components';
import { RevertIcon } from '@commercetools-uikit/icons';
import { useParams } from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import {
  transformLocalizedStringToLocalizedField,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { useTypeDefinitionCreator } from '../type-definition-connectors';
import { PERMISSIONS } from '../../../constants';
import { transformErrors } from '../../subscriptions/transform-errors';
import {
  TFieldDefinitionInput,
  TFieldTypeInput,
} from '../../../types/generated/ctp';
import messages from './messages';
import FieldDefinitionInputForm from './FieldDefinitionInputForm';

type Props = {
  onClose: () => void;
};

const NewFieldDefinitionInput: FC<Props> = ({ onClose }) => {
  const { id, version } = useParams<{
    id: string;
    version: string;
  }>();

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const showNotification = useShowNotification();

  const typeDefinitionCreator = useTypeDefinitionCreator();

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const intl = useIntl();

  const handleSubmit = useCallback(
    async (formikValues, formikHelpers) => {
      try {
        let type: TFieldTypeInput = { Boolean: {} };

        switch (formikValues.type.name) {
          case 'Boolean': {
            type = { Boolean: {} };
            break;
          }
          case 'Date': {
            type = { Date: {} };
            break;
          }
          case 'DateTime': {
            type = { DateTime: {} };
            break;
          }
          // case 'Enum': {
          //   type = { Enum: {} };
          //   break;
          // }
          // case 'LocalizedEnum': {
          //   type = { LocalizedEnum: {} };
          //   break;
          // }
          case 'LocalizedString': {
            type = { LocalizedString: {} };
            break;
          }
          case 'Money': {
            type = { Money: {} };
            break;
          }
          case 'Number': {
            type = { Number: {} };
            break;
          }
          case 'Reference': {
            type = {
              Reference: { referenceTypeId: formikValues.type.referenceTypeId },
            };
            break;
          }
          // case 'Set': {
          //   type = { Set: {} };
          //   break;
          // }
          case 'String': {
            type = { String: {} };
            break;
          }
          case 'Time': {
            type = { Time: {} };
            break;
          }
        }

        const actionDraft: TFieldDefinitionInput = {
          name: formikValues.name,
          required: formikValues.required || false,
          inputHint: formikValues.inputHint || {
            SingleLine: 'SingleLine',
          },
          type: type,
          label: transformLocalizedStringToLocalizedField(
            LocalizedTextInput.omitEmptyTranslations(formikValues.label)
          ),
        };
        await typeDefinitionCreator.execute({
          id: id,
          version: Number(version),
          actions: [{ addFieldDefinition: { fieldDefinition: actionDraft } }],
        });

        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.fieldDefinitionUpdated, {}),
        });
        onClose();
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
    [id, intl, onClose, showNotification, typeDefinitionCreator, version]
  );

  return (
    <FieldDefinitionInputForm
      initialValues={{
        label: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString([]) ?? {}
        ),
        name: '',
        inputHint: 'SingleLine',
        type: { name: '' },
      }}
      onSubmit={handleSubmit}
      createNewMode={true}
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
                  label={messages.newButton}
                  onClick={() => formProps.submitForm()}
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                />
              </>
            }
          >
            {formProps.formElements}
          </CustomFormModalPage>
        );
      }}
    </FieldDefinitionInputForm>
  );
};

NewFieldDefinitionInput.displayName = 'NewFieldDefinitionInput';

export default NewFieldDefinitionInput;
