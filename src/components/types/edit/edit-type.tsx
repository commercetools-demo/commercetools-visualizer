import React, { FC, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import Text from '@commercetools-uikit/text';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Spacings from '@commercetools-uikit/spacings';
import {
  CustomFormDetailPage,
  CustomFormModalPage,
  FormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { useTypeDefinitionFetcher } from '../subscription-connectors';
import { getErrorMessage } from '../../../helpers';
import { PERMISSIONS } from '../../../constants';
import { transformErrors } from '../../subscriptions/transform-errors';
import TypeDefinitionDetailsForm from '../type-form/TypeDefinitionDetailsForm';
import messages from './messages';

type Props = {
  linkToWelcome: string;
};

const EditType: FC<Props> = ({ linkToWelcome }) => {
  const history = useHistory();
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const { id } = useParams<{ id: string }>();
  const backToList = `/${linkToWelcome}/types`;
  const showNotification = useShowNotification();
  // const showSuccessNotification = useShowSideNotification(
  //   NOTIFICATION_KINDS_SIDE.success,
  //   messages.createSuccess
  // );
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { typeDefinition, error, loading } = useTypeDefinitionFetcher({
    id: id,
  });

  const handleSubmit = useCallback(
    async (formikValues, formikHelpers) => {
      try {
        // subscription &&
        //   (await subscriptionKeyUpdater.execute({
        //     originalDraft: subscription,
        //     nextDraft: formikValues,
        //   }));
        // showNotification({
        //   kind: 'success',
        //   domain: DOMAINS.SIDE,
        //   text: intl.formatMessage(messages.subscriptionUpdated, {
        //     subscriptionKey: subscription?.key,
        //   }),
        // });
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
    [intl, showApiErrorNotification, showNotification]
  );

  const handleDelete = async () => {
    // await subscriptionDeleter.execute({
    //   id: subscription.id,
    //   version: subscription.version,
    // });
    // showNotification({
    //   kind: 'success',
    //   domain: DOMAINS.SIDE,
    //   text: intl.formatMessage(messages.subscriptionUpdated, {
    //     subscriptionKey: subscription?.key,
    //   }),
    // });
    history.replace({
      pathname: backToList,
    });
  };

  // async function submitUpdateActions(updateActions) {
  //   console.log('update actions', updateActions);
  //   setError(false);
  //   setLoading(true);
  //   try {
  //     const response = await asyncDispatch(
  //       sdkActions.post({
  //         service: 'types',
  //         options: {
  //           id: id,
  //         },
  //         payload: { version: data.version, actions: updateActions },
  //       })
  //     );
  //     setData(response);
  //     push(backToList);
  //   } catch (error) {
  //     console.log(error);
  //     setError(true);
  //     showApiErrorNotification({ errors: error.message });
  //   }
  //   setLoading(false);
  // }

  // function onSubmit(values) {
  //   const { name, description, fieldDefinitions } = values;
  //   console.log(values);
  //   const syncTypes = createSyncTypes();
  //   const newData = {
  //     ...data,
  //     name,
  //     description,
  //     fieldDefinitions,
  //   };
  //   console.log(data, newData);
  //   const actions = syncTypes.buildActions(newData, data);
  //   // Submit Updates
  //   submitUpdateActions(actions);
  // }

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
  if (!typeDefinition) {
    return <PageNotFound />;
  }

  return (
    <TypeDefinitionDetailsForm
      initialValues={{
        id: typeDefinition.id,
        key: typeDefinition.key,
        name: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString(
            typeDefinition.nameAllLocales ?? []
          ) ?? {}
        ),
        description: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString(
            typeDefinition.descriptionAllLocales ?? []
          ) ?? {}
        ),
        resourceTypeIds: typeDefinition.resourceTypeIds,
        fieldDefinitions: typeDefinition.fieldDefinitions,
      }}
      onSubmit={handleSubmit}
      isReadOnly={!canManage}
      dataLocale={dataLocale}
    >
      {(formProps) => {
        return (
          <CustomFormDetailPage
            title={intl.formatMessage(messages.title)}
            onPreviousPathClick={() => history.push(linkToWelcome + '/types')}
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
            {typeDefinition && formProps.formElements}
          </CustomFormDetailPage>
        );
      }}
    </TypeDefinitionDetailsForm>
  );
  // <View>
  //   {data?.id ? (
  //     <>
  //       <ViewHeader
  //         title={<FormattedMessage {...messages.title} />}
  //         backToList={
  //           <BackToList
  //             href={backToList}
  //             label={intl.formatMessage(messages.backButton)}
  //           />
  //         }
  //         commands={<DeleteType typeId={id} typeVersion={data.version} />}
  //       />
  //       <Spacings.Inset scale="l">
  //         <Spacings.Stack scale="m">
  //           <TypeForm onSubmit={onSubmit} type={data} />
  //         </Spacings.Stack>
  //       </Spacings.Inset>
  //     </>
  //   ) : null}
  // </View>
};
EditType.displayName = 'EditType';

export default EditType;
