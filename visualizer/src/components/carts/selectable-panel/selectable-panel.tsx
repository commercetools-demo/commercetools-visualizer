import { FC, memo } from 'react';
import classnames from 'classnames';
import styles from './selectable-panel.module.css';
import Spacings from '@commercetools-uikit/spacings';

interface Props {
  header: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
}

const SelectablePanel: FC<Props> = ({ header, children, isOpen = false }) => {
  return (
    <div className={styles['editable-form-box']}>
      <div
        className={classnames({
          [styles.title]: isOpen,
          [styles['collapsed-title']]: !isOpen,
        })}
      >
        {header}
      </div>
      {isOpen && <Spacings.Inset scale="l">{children}</Spacings.Inset>}
    </div>
  );
};

export default memo(SelectablePanel);
