import { FC } from 'react';
import Step from '../step';
import { Skin } from '../step/step';
import styles from './steps.module.css';

type Props = {
  steps: Array<{
    isClickable?: boolean;
    key: string;
    label: string;
    onClick?: () => void;
  }>;
  activeStepKey: string;
  skin?: Skin;
};

export const Steps: FC<Props> = ({
  steps,
  activeStepKey,
  skin = Skin.white,
}) => {
  const activeStepIndex = steps.findIndex((step) => step.key === activeStepKey);
  return (
    <div className={styles['header-list']}>
      {steps.map((step, index) => (
        <Step
          isClickable={step.isClickable}
          key={step.key}
          label={step.label}
          onClick={step.onClick}
          isDone={index < activeStepIndex}
          isActive={activeStepKey === step.key}
          index={index}
          skin={skin}
        />
      ))}
    </div>
  );
};

Steps.displayName = 'Steps';

export default Steps;
