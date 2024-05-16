import styles from './cart-details-general-info-header.module.css';
import { TCart } from '../../../types/generated/ctp';
import { FC } from 'react';
import MetaDates from '../../meta-dates';
import Spacings from '@commercetools-uikit/spacings';

type Props = { cart: TCart };
const CartDetailsGeneralInfoHeader: FC<Props> = ({ cart }) => {
  return (
    <Spacings.Inline justifyContent="space-between" scale="m">
      <div className={styles['header-dates-container']}>
        <MetaDates created={cart.createdAt} modified={cart.lastModifiedAt} />
      </div>
    </Spacings.Inline>
  );
};

CartDetailsGeneralInfoHeader.displayName = 'OrderDetailsGeneralInfoTabHeader';

export default CartDetailsGeneralInfoHeader;
