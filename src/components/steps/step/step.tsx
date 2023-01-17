import classnames from 'classnames';
import AccessibleButton from '@commercetools-uikit/accessible-button';
import { CheckThinIcon } from '@commercetools-uikit/icons';
import { FC } from 'react';
import styles from './step.module.css';

export enum Skin {
  grey = 'grey',
  white = 'white',
}

type Props = {
  isClickable?: boolean;
  index: number;
  label: string;
  isActive?: boolean;
  isDone?: boolean;
  onClick?: (props: any) => void;
  skin?: Skin;
};

export const Step: FC<Props> = ({
  isClickable = false,
  index,
  label,
  isActive,
  isDone,
  onClick,
  skin = Skin.grey,
}) => {
  return (
    <li
      className={classnames(styles['header-list-item'], {
        [styles['header-list-item--active']]: isActive,
        [styles['header-list-item--done']]: isDone,
      })}
    >
      <AccessibleButton
        type="button"
        className={styles['header-list-item-button']}
        label={label}
        isDisabled={!isDone || !isClickable}
        onClick={onClick}
      >
        <div className={styles[`bullet-container-${skin}`]}>
          <div className={styles.bullet}>
            {isDone ? (
              <CheckThinIcon color="surface" size="medium" />
            ) : (
              index + 1
            )}
          </div>
        </div>
        <span className={styles[`tab-text-${skin}`]}>{label}</span>
      </AccessibleButton>
    </li>
  );
};

Step.displayName = 'Step';

export default Step;
