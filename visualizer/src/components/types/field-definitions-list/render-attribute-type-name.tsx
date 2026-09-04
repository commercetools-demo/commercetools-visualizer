import { ReactElement } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Badge, Flex, Text } from '@commercetools/nimbus';
import {
  TFieldType,
  TReferenceType,
  TSetType,
} from '../../../types/generated/ctp';
import messages from './messages';

const LocalizedLabel = () => {
  const intl = useIntl();

  return (
    <Badge colorPalette="info">
      {intl.formatMessage(messages.localizedLabel)}
    </Badge>
  );
};

export const renderAttributeTypeName = (
  fieldType: TFieldType
): ReactElement => {
  switch (fieldType?.name) {
    case 'Boolean':
      return (
        <Text>
          <FormattedMessage {...messages.attributeLabelBoolean} />
        </Text>
      );
    case 'Date':
      return (
        <Text>
          <FormattedMessage {...messages.attributeLabelDate} />
        </Text>
      );
    case 'DateTime':
      return (
        <Text>
          <FormattedMessage {...messages.attributeLabelDateTime} />
        </Text>
      );
    case 'Enum':
      return (
        <Text>
          <FormattedMessage {...messages.attributeLabelEnum} />
        </Text>
      );

    case 'LocalizedEnum':
      return (
        <Flex justifyContent="space-between" alignItems="center" gap="200">
          <Text>
            <FormattedMessage {...messages.attributeLabelEnum} />
          </Text>
          <LocalizedLabel />
        </Flex>
      );
    case 'LocalizedString':
      return (
        <Flex justifyContent="space-between" alignItems="center" gap="200">
          <Text>
            <FormattedMessage {...messages.attributeLabelText} />
          </Text>
          <LocalizedLabel />
        </Flex>
      );
    case 'Money':
      return (
        <Text>
          <FormattedMessage {...messages.attributeLabelMoney} />
        </Text>
      );
    case 'Number':
      return (
        <Text>
          <FormattedMessage {...messages.attributeLabelNumber} />
        </Text>
      );
    case 'Reference':
      const ref = fieldType as TReferenceType;
      return (
        <Text>
          <FormattedMessage
            {...messages.attributeLabelReference}
            values={{
              referenceType: ref.referenceTypeId,
            }}
          />
        </Text>
      );
    case 'Set':
      const set = fieldType as TSetType;
      return renderAttributeTypeName(set.elementType);
    case 'Text':
    case 'String':
      return (
        <Text>
          <FormattedMessage {...messages.attributeLabelText} />
        </Text>
      );
    case 'Time':
      return (
        <Text>
          <FormattedMessage {...messages.attributeLabelTime} />
        </Text>
      );
    default:
      return <Text>{fieldType?.name || ''}</Text>;
  }
};
