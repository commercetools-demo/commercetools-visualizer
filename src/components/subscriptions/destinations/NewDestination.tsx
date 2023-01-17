import { FC } from 'react';

type Props = {
  destinationType?: string;
};

const NewDestination: FC<Props> = ({ destinationType }) => {
  switch (destinationType) {
    case 'GoogleCloudPubSub':
      return <div>MOEP</div>;
  }
  return <div>{destinationType}</div>;
};

export default NewDestination;
