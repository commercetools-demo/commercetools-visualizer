import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';

export default function formatCustomerAddress({
  streetName,
  streetNumber,
}: {
  streetName?: string | null;
  streetNumber?: string | null;
}) {
  const maybeStreetNameAndNumber = [
    streetName && streetName.trim(),
    streetNumber,
  ].filter(Boolean);

  if (maybeStreetNameAndNumber.length === 0) return NO_VALUE_FALLBACK;

  return maybeStreetNameAndNumber.join(' ');
}
