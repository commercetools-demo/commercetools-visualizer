import { FC } from "react";
import { TDestination, TGoogleCloudPubSubDestination } from "../../../types/generated/ctp";

type Props = {
    destination: TDestination
}

const Destinations: FC<Props> = ({ destination }) => {
    switch (destination.type) {
        default: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const casted: any = destination as any;
            const { type, __typename, ...rest } = casted;
            return <> {Object.entries(rest).map(([key, value]) => { return <div key={key}>{`${key}: ${value}`}</div> })}</>
        }
    }

}

export default Destinations;