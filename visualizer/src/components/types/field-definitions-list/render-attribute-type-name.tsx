import {
  TFieldType,
  TReferenceType,
  TSetType,
} from '../../../types/generated/ctp';
import Text from '@commercetools-uikit/text';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import Stamp from '@commercetools-uikit/stamp';
import Spacings from '@commercetools-uikit/spacings';
import { ReactElement } from 'react';

const LocalizedLabel = () => {
  const intl = useIntl();

  return (
    <Stamp
      label={intl.formatMessage(messages.localizedLabel)}
      tone="information"
    />
  );
};

export const renderAttributeTypeName = (
  fieldType: TFieldType
): ReactElement => {
  switch (fieldType?.name) {
    case 'Boolean':
      return (
        <Text.Detail>
          <FormattedMessage {...messages.attributeLabelBoolean} />
        </Text.Detail>
      );
    case 'Date':
      return (
        <Text.Detail>
          <FormattedMessage {...messages.attributeLabelDate} />
        </Text.Detail>
      );
    case 'DateTime':
      return (
        <Text.Detail>
          <FormattedMessage {...messages.attributeLabelDateTime} />
        </Text.Detail>
      );
    case 'Enum':
      return (
        <Text.Detail>
          <FormattedMessage {...messages.attributeLabelEnum} />
        </Text.Detail>
      );

    case 'LocalizedEnum':
      return (
        <Spacings.Inline justifyContent={'space-between'}>
          <Text.Detail>
            <FormattedMessage {...messages.attributeLabelEnum} />
          </Text.Detail>
          <LocalizedLabel />
        </Spacings.Inline>
      );
    case 'LocalizedString':
      return (
        <Spacings.Inline justifyContent={'space-between'}>
          <Text.Detail>
            <FormattedMessage {...messages.attributeLabelText} />
          </Text.Detail>
          <LocalizedLabel />
        </Spacings.Inline>
      );
    case 'Money':
      return (
        <Text.Detail>
          <FormattedMessage {...messages.attributeLabelMoney} />
        </Text.Detail>
      );
    case 'Number':
      return (
        <Text.Detail>
          <FormattedMessage {...messages.attributeLabelNumber} />
        </Text.Detail>
      );
    case 'Reference':
      const ref = fieldType as TReferenceType;
      return (
        <Text.Detail>
          <FormattedMessage
            {...messages.attributeLabelReference}
            values={{
              referenceType: ref.referenceTypeId,
            }}
          />
        </Text.Detail>
      );
    case 'Set':
      const set = fieldType as TSetType;
      return renderAttributeTypeName(set.elementType);
    case 'Text':
    case 'String':
      return (
        <Text.Detail>
          <FormattedMessage {...messages.attributeLabelText} />
        </Text.Detail>
      );
    case 'Time':
      return (
        <Text.Detail>
          <FormattedMessage {...messages.attributeLabelTime} />
        </Text.Detail>
      );
    default:
      console.log(fieldType);
      return <Text.Detail>{fieldType?.name || ''}</Text.Detail>;
  }
};
