import { useIntl } from 'react-intl';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { FC } from 'react';
import styles from './save-toolbar.module.css';
import messages from './messages';

type ButtonProps = { isDisabled?: boolean; label?: string };

type Props = {
  buttonProps?: {
    cancel?: ButtonProps;
    back?: ButtonProps;
    next?: ButtonProps;
    save?: ButtonProps;
  };
  isVisible?: boolean;
  isNextDisabled?: boolean;
  currentStep: number;
  totalSteps: number;
  onSave?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  onCancel: () => void;
};

const StepperToolbar: FC<Props> = ({
  isVisible,
  buttonProps,
  onCancel,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSave,
}) => {
  const { formatMessage } = useIntl();
  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <ul className={styles['list-left']}>
        <li className={styles['list-item']}>
          <SecondaryButton
            label={formatMessage(messages.cancel)}
            onClick={onCancel}
            {...buttonProps?.cancel}
          />
        </li>
      </ul>

      <ul className={styles['list-right']}>
        {currentStep > 1 && onBack ? (
          <li className={styles['list-item']}>
            <SecondaryButton
              label={formatMessage(messages.back)}
              onClick={onBack}
              {...buttonProps?.back}
            />
          </li>
        ) : null}
        <li className={styles['list-item']}>
          {currentStep !== totalSteps
            ? onNext && (
                <PrimaryButton
                  label={formatMessage(messages.next)}
                  onClick={onNext}
                  {...buttonProps?.next}
                />
              )
            : onSave && (
                <PrimaryButton
                  label={formatMessage(messages.save)}
                  onClick={onSave}
                  {...buttonProps?.save}
                />
              )}
        </li>
      </ul>
    </div>
  );
};
export default StepperToolbar;
