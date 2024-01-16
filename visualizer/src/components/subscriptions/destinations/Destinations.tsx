import { FC } from 'react';
import { TDestination } from '../../../types/generated/ctp';

type Props = {
  destination: TDestination;
};

const Destinations: FC<Props> = ({ destination }) => {
  switch (destination.type) {
    default: {
      const casted: any = destination as any;
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { type, __typename, ...rest } = casted;
      return (
        <>
          {Object.entries(rest).map(([key, value]) => {
            return <div key={key}>{`${key}: ${value}`}</div>;
          })}
        </>
      );
    }
  }
};

export default Destinations;
