import { FC } from 'react';
import { StepProps } from '../cart-create/cart-create';
import CartCreateAddLineItems from '../cart-create-add-line-items';
import { useHistory } from 'react-router';
import StepperToolbar from '../../save-toolbar/StepperToolbar';
import { TCart } from '../../../types/generated/ctp';

type Props = StepProps & { cart: TCart };

export const CartCreatePickItems: FC<Props> = ({
  currentStep,
  goToNextStep,
  goToPreviousStep,
  totalSteps,
  linkToWelcome,
  cart,
}) => {
  const history = useHistory();
  return (
    <>
      <CartCreateAddLineItems cart={cart} />
      <StepperToolbar
        isVisible={true}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={goToNextStep}
        onBack={goToPreviousStep}
        onCancel={() => {
          history.replace({
            pathname: linkToWelcome + '/carts',
          });
        }}
      />
    </>
  );
};

export default CartCreatePickItems;
