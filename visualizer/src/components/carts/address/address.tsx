import messages from './messages';
import Grid from '@commercetools-uikit/grid';
import Text from '@commercetools-uikit/text';
import { TAddress } from '../../../types/generated/ctp';

// This function just resolves the saluation for the customer
const resolveSalutation = (address: TAddress) => {
  if (address.title) return address.title;
  if (address.salutation) return address.salutation;
  return null;
};

interface AddressProps {
  address?: TAddress | null;
  countries?: Record<string, string>;
  labelMissing?: string | React.ReactNode;
}

const Address = (props: AddressProps) => {
  const { address } = props;

  if (!address || Object.keys(address).length === 0)
    return <Text.Detail>{props.labelMissing}</Text.Detail>;

  return (
    <>
      {(address.firstName || address.lastName) && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.name}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>
              {resolveSalutation(address)} {address.firstName}{' '}
              {address.lastName}
            </Text.Body>
          </Grid.Item>
        </>
      )}
      {(address.streetName || address.streetNumber) && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.address}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>
              {address.streetName + ' ' + address.streetNumber}
            </Text.Body>
          </Grid.Item>
        </>
      )}
      {address.additionalStreetInfo && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.additionalStreetInfo}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.additionalStreetInfo}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address.apartment && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.apartment}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.apartment}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address.city && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.city}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.city}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address.postalCode && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.postalCode}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.postalCode}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address.region && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.region}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.region}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address.state && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.state}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.state}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address.country && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.country}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>
              {props.countries
                ? props.countries[address.country.toLowerCase()]
                : address.country}
            </Text.Body>
          </Grid.Item>
        </>
      )}
      {address.company && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.company}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.company}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address?.phone && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.phone}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.phone}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address?.mobile && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.mobile}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.mobile}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address?.email && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.email}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.email}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address?.fax && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.fax}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.fax}</Text.Body>
          </Grid.Item>
        </>
      )}
      {address.additionalAddressInfo && (
        <>
          <Grid.Item>
            <Text.Body
              isBold={false}
              tone="secondary"
              intlMessage={messages.additionalAddressInformation}
            />
          </Grid.Item>
          <Grid.Item>
            <Text.Body>{address.additionalAddressInfo}</Text.Body>
          </Grid.Item>
        </>
      )}
    </>
  );
};

export default Address;
