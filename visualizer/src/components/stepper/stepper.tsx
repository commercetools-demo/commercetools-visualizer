import PropTypes from 'prop-types';
import { PureComponent } from 'react';

type Props = {
  numberOfSteps: number;
  children: ({
    step,
    next,
    prev,
  }: {
    step: number;
    next: () => void;
    prev: () => void;
  }) => void;
};

interface State {
  currentStep: number;
}

class Stepper extends PureComponent<Props, State> {
  static displayName = 'Stepper';
  static propTypes = {
    numberOfSteps: PropTypes.number.isRequired,
    children: PropTypes.func.isRequired,
  };

  state: Readonly<State> = {
    currentStep: 0,
  };

  handleNextStep = () => {
    if (this.state.currentStep === this.props.numberOfSteps - 1) return;
    this.setState({
      currentStep: this.state.currentStep + 1,
    });
  };

  handlePrevStep = () => {
    if (this.state.currentStep === 0) return;
    this.setState({
      currentStep: this.state.currentStep - 1,
    });
  };

  render() {
    return this.props.children({
      step: this.state.currentStep,
      next: this.handleNextStep,
      prev: this.handlePrevStep,
    });
  }
}

export default Stepper;
