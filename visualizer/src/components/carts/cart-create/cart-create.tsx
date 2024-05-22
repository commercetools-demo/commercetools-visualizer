import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import { TCartDraft } from '../../../types/generated/ctp';
import { DOMAINS } from '@commercetools-frontend/constants';
import messages from './messages';
import { transformErrors } from '../../subscriptions/transform-errors';
import { useCartCreator } from '../../../hooks/use-carts-hook';
import CartForm from '../cart-form/cart-form';
import { FormModalPage } from '@commercetools-frontend/application-components';

type Props = {
  onClose: () => void;
  onCreate: (id: string) => void;
};

const CartCreate: FC<Props> = ({ onClose, onCreate }) => {
  const intl = useIntl();
  const showNotification = useShowNotification();
  const cartCreator = useCartCreator();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const handleSubmit = useCallback(
    async (formikValues, formikHelpers) => {
      try {
        const draft: TCartDraft = {
          key: formikValues.key,
          currency: formikValues.currency,
        };
        const result = await cartCreator.execute({
          draft: draft,
        });
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.createSuccess),
        });
        result.data?.createCart?.id && onCreate(result.data?.createCart?.id);
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
    [intl, cartCreator]
  );
  return (
    <CartForm
      initialValues={{
        currency: 'EUR',
      }}
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
    </CartForm>
  );
};

export default CartCreate;
