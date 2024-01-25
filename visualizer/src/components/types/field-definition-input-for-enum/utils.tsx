import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { customProperties } from '@commercetools-uikit/design-system';

export function createColumnDefinitions(
  enumLanguages: Array<string>,
  isLocalized: boolean
) {
  return [
    // key column
    {
      key: 'key',
      label: <FormattedMessage {...messages.tableHeaderLabelKey} />,
      isSortable: false,
    },
    // label column
    ...(isLocalized
      ? enumLanguages?.map((lang: string) => ({
          key: `label_${lang}`,
          label: (
            <FormattedMessage
              {...messages.tableHeaderLocalizedLabelLabel}
              values={{
                language: lang.toUpperCase(),
              }}
            />
          ),
          isSortable: false,
        }))
      : [
          {
            key: 'label',
            label: <FormattedMessage {...messages.tableHeaderLabelLabel} />,
            isSortable: false,
            width: `minmax(${customProperties.constraint5}, auto)`,
          },
        ]),
    // delete column
    {
      key: 'delete',
      width: 'max-content',
      label: '',
    },
  ];
}
