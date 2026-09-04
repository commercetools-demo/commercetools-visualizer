import {
  formatLocalizedString as l10nFormatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { LocalizedField } from '@commercetools-frontend/l10n/dist/declarations/src/types';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';

export const formatLocalizedString = (
  localizedField: Array<LocalizedField> | undefined | null,
  dataLocale: string,
  projectLanguages: Array<string>,
  fallback = NO_VALUE_FALLBACK
) => {
  return l10nFormatLocalizedString(
    {
      name: transformLocalizedFieldToLocalizedString(localizedField ?? []),
    },
    {
      key: 'name',
      locale: dataLocale,
      fallbackOrder: projectLanguages,
      fallback: fallback,
    }
  );
};
