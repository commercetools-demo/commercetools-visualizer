import styles from './address-container.module.css';
import { FC, PropsWithChildren } from 'react';
import Grid from '@commercetools-uikit/grid';
import { customProperties } from '@commercetools-uikit/design-system';

interface Props extends PropsWithChildren<{}> {}

const AddressContainer: FC<Props> = ({ children }) => (
  <div className={styles['address-container']}>
    <Grid gridRowGap={customProperties.spacingXs} gridTemplateColumns="2fr 3fr">
      {children}
    </Grid>
  </div>
);

export default AddressContainer;
