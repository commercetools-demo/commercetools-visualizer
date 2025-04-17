import { FC, memo } from 'react';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';

import StatusFilterSection from '../status-filter-section';
import CreatedAtFilterSection from '../created-at-filter-section';
import { FilterValue } from '../../carts-list';
// import StatusFilterSection from '../status-filter-section';

export type Filter = {
  id: string;
  type: string;
};

type Props = {
  filter: Filter;
  activeValue?: FilterValue;
  onChange: (filter: string, value: FilterValue) => void;
};

const FilterSection: FC<Props> = ({ filter, activeValue, onChange }) => {
  const getFilterComponent = () => {
    switch (filter.type) {
      // case 'productTypes':
      //   return ProductTypeFilterSection;
      // case 'categories':
      //   return CategoryFilterSection;
      // case 'statuses':
      //   return StatusFilterSection;
      case 'status':
        return StatusFilterSection;
      // case 'lastModifiedAt':
      //   return LastMofifiedAtFilterSection;
      // case 'attribute':
      //   return AttributeFilterSection;
      // case 'searchTerm':
      //   return () => null;
      case 'createdAt':
        return CreatedAtFilterSection;
      // case 'inventoryPerVariant':
      //   return InventoryPerVariantFilterSection;
      // case 'productSelections':
      //   return ProductSelectionFilterSection;
      default:
        throw new Error('unsupported filter type');
    }
  };

  if (!filter) return <LoadingSpinner />;
  const FilterComponent = getFilterComponent();

  return (
    <FilterComponent
      activeValue={activeValue}
      onChange={onChange}
      filter={filter}
    />
  );
};

export default memo(FilterSection);
