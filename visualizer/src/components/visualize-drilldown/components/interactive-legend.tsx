import React from 'react';
import { useIntl } from 'react-intl';
import { EntityType } from '../types';
import Text from '@commercetools-uikit/text';
import messages from '../messages';

interface LegendItem {
  entityType: EntityType;
  label: string;
  count: number;
  total?: number;
  hasMore: boolean;
  color: string;
  visible: boolean;
}

interface InteractiveLegendProps {
  legend: LegendItem[];
  visibleEntityTypes: Set<EntityType>;
  onToggleEntityType: (entityType: EntityType) => void;
  onShowAll?: () => void;
  onHideAll?: () => void;
}

export const InteractiveLegend: React.FC<InteractiveLegendProps> = ({
  legend,
  visibleEntityTypes,
  onToggleEntityType,
  onShowAll,
  onHideAll,
}) => {
  const intl = useIntl();

  if (legend.length === 0) {
    return null;
  }

  const allHidden = legend.every(
    (item) => !visibleEntityTypes.has(item.entityType)
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
      }}
    >
      <Text.Caption tone="secondary">
        {intl.formatMessage(messages.legend)}
      </Text.Caption>

      {/* Show/Hide All button */}
      <div
        onClick={allHidden ? onShowAll : onHideAll}
        style={{
          padding: '4px 8px',
          backgroundColor: '#e6f3ff',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          border: '1px solid #0066cc',
          color: '#0066cc',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#cce7ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#e6f3ff';
        }}
      >
        {allHidden
          ? intl.formatMessage(messages.showAll)
          : intl.formatMessage(messages.hideAll)}
      </div>

      {legend.map(({ entityType, label, count, total, hasMore, color }) => {
        const isVisible = visibleEntityTypes.has(entityType);

        return (
          <div
            key={entityType}
            onClick={() => onToggleEntityType(entityType)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: isVisible ? '#f7f7f7' : '#e8e8e8',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              border: '1px solid transparent',
              opacity: isVisible ? 1 : 0.6,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0066cc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: isVisible ? color : '#ccc',
                borderRadius: '2px',
                transition: 'background-color 0.2s ease',
              }}
            />
            <span
              style={{
                textDecoration: isVisible ? 'none' : 'line-through',
                color: isVisible ? '#333' : '#999',
              }}
            >
              {label} ({count}
              {total && total > count ? ` of ${total}` : ''})
            </span>
          </div>
        );
      })}
    </div>
  );
};
