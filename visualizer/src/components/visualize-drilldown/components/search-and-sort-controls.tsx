import SearchTextInput from '@commercetools-uikit/search-text-input';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDrilldownFetcher } from '../hooks/use-drilldown-fetcher';
import { EntityType, SearchAndSortState, SortDirection } from '../types';
import {
  ENTITY_SORTABLE_FIELDS,
  SEARCH_FIELD_LABELS,
  SORTABLE_FIELD_LABELS,
} from '../utils/relationship-contstants';
import messages from '../messages';

interface SearchAndSortControlsProps {
  entityType: EntityType;
  searchAndSortState: SearchAndSortState;
  onSearchChange: (searchQuery: string) => void;
  onSortChange: (field: string, direction: SortDirection) => void;
  onClearSearch: () => void;
}

export const SearchAndSortControls: React.FC<SearchAndSortControlsProps> = ({
  entityType,
  searchAndSortState,
  onSearchChange,
  onSortChange,
  onClearSearch,
}) => {
  const intl = useIntl();
  const { ENTITY_SEARCH_MAPPINGS } = useDrilldownFetcher();
  const searchQueryMapping = ENTITY_SEARCH_MAPPINGS[entityType];
  const hasSearchMapping =
    searchQueryMapping !== undefined && searchQueryMapping(entityType);

  const sortableFields = ENTITY_SORTABLE_FIELDS[entityType] || [];

  const getNextSortDirection = (
    currentDirection: SortDirection
  ): SortDirection => {
    switch (currentDirection) {
      case 'none':
        return 'asc';
      case 'asc':
        return 'desc';
      case 'desc':
        return 'none';
      default:
        return 'asc';
    }
  };

  const getSortButtonLabel = (field: string, direction: SortDirection) => {
    const fieldLabel = SORTABLE_FIELD_LABELS[field] || field;
    switch (direction) {
      case 'asc':
        return `${fieldLabel} ↑`;
      case 'desc':
        return `${fieldLabel} ↓`;
      default:
        return fieldLabel;
    }
  };

  const getSortButtonTone = (
    direction: SortDirection
  ): 'secondary' | 'info' => {
    return direction !== 'none' ? 'info' : 'secondary';
  };

  // Check if any field is currently being sorted (for single-sort limitation)
  const activeSortField = Object.entries(searchAndSortState.sortStates).find(
    ([, direction]) => direction !== 'none'
  )?.[0];

  if (!hasSearchMapping && sortableFields.length === 0) {
    return null;
  }

  return (
    <Spacings.Inline scale="m" justifyContent="space-between">
      {hasSearchMapping && (
        <Spacings.Stack scale="s">
          <Text.Subheadline as="h4">
            {intl.formatMessage(messages.searchTitle)}
          </Text.Subheadline>
          <SearchTextInput
            value={searchAndSortState.searchQuery}
            onSubmit={(value) => onSearchChange(value)}
            onReset={onClearSearch}
            placeholder={`Search by ${SEARCH_FIELD_LABELS[entityType]}...`}
            horizontalConstraint={7}
          />
        </Spacings.Stack>
      )}

      {sortableFields.length > 0 && (
        <Spacings.Stack scale="s" alignItems="flex-end">
          <Text.Subheadline as="h4">
            {intl.formatMessage(messages.sortByTitle)}
          </Text.Subheadline>
          <Spacings.Inline scale="xs" justifyContent="flex-end">
            {sortableFields.map((field) => {
              // Only show sort state for the currently active field, others show 'none'
              const isActiveField = activeSortField === field;
              const currentDirection = isActiveField
                ? searchAndSortState.sortStates[field] || 'none'
                : 'none';
              const nextDirection = getNextSortDirection(currentDirection);

              return (
                <SecondaryButton
                  key={field}
                  label={getSortButtonLabel(field, currentDirection)}
                  onClick={() => onSortChange(field, nextDirection)}
                  tone={getSortButtonTone(currentDirection)}
                  size="small"
                />
              );
            })}
          </Spacings.Inline>
          {activeSortField && (
            <Text.Detail tone="secondary">
              {intl.formatMessage(messages.currentlySortingBy, {
                field:
                  SORTABLE_FIELD_LABELS[activeSortField] || activeSortField,
              })}
            </Text.Detail>
          )}
        </Spacings.Stack>
      )}
    </Spacings.Inline>
  );
};
