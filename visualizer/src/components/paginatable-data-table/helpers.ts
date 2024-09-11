import {
  formatLocalizedString as funcFormatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { LocalizedField } from '@commercetools-frontend/l10n/dist/declarations/src/types';
import { IntlShape } from 'react-intl';

export function renderDefault(item: unknown) {
  if (!item) {
    return NO_VALUE_FALLBACK;
  }
  if (typeof item === 'string' || item instanceof String) {
    return item;
  }
  if (typeof item === 'number' || item instanceof Number) {
    return item;
  }
  return JSON.stringify(item);
}

export const formatLocalizedString = (
  localizedField: Array<LocalizedField> | undefined | null,
  dataLocale: string,
  projectLanguages: Array<string>
) => {
  return funcFormatLocalizedString(
    {
      name: transformLocalizedFieldToLocalizedString(localizedField ?? []),
    },
    {
      key: 'name',
      locale: dataLocale,
      fallbackOrder: projectLanguages,
      fallback: NO_VALUE_FALLBACK,
    }
  );
};

export const formatDateAndTime = (dateAndTime: string, intl: IntlShape) => {
  console.log(dateAndTime);
  return `${intl.formatDate(dateAndTime)} ${intl.formatTime(dateAndTime)}`;
};
