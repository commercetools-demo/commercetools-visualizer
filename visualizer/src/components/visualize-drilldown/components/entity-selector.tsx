import React from 'react';
import { useIntl } from 'react-intl';
import { EntityType } from '../types';
import { relationshipManager } from '../utils/relationship-utils';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { ENTITY_LABELS } from '../utils/relationship-contstants';
import messages from '../messages';

interface EntitySelectorProps {
  selectedEntityType: EntityType | null;
  onEntityTypeSelect: (entityType: EntityType) => void;
  loading?: boolean;
}

export const EntitySelector: React.FC<EntitySelectorProps> = ({
  selectedEntityType,
  onEntityTypeSelect,
  loading = false,
}) => {
  const intl = useIntl();
  const rootEntityTypes = relationshipManager.getRootEntityTypes();

  return (
    <Spacings.Stack scale="m">
      <Text.Headline as="h3">
        {intl.formatMessage(messages.selectEntityTypeTitle)}
      </Text.Headline>
      <Text.Body>
        {intl.formatMessage(messages.selectEntityTypeDescription)}
      </Text.Body>
      <Spacings.Inline scale="s">
        {rootEntityTypes.map((entityType) => {
          const isSelected = selectedEntityType === entityType;
          const ButtonComponent = isSelected ? PrimaryButton : SecondaryButton;

          return (
            <ButtonComponent
              key={entityType}
              label={ENTITY_LABELS[entityType]}
              onClick={() => onEntityTypeSelect(entityType)}
              isDisabled={loading}
              size="medium"
            />
          );
        })}
      </Spacings.Inline>
    </Spacings.Stack>
  );
};
