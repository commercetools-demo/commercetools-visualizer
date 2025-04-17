import { FC } from 'react';
import { useIntl } from 'react-intl';
import messages from './messages';
import Spacings from '@commercetools-uikit/spacings';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import FacetedFilterStatus from '../faceted-filter-status';
import { TCartState } from '../../../../../types/generated/ctp';
import { TTone } from '@commercetools-uikit/stamp';
import { Filter } from '../filter-section/filter-section';
import { FilterValue } from '../../carts-list';

interface StatusFilterSectionProps {
  filter: Filter;
  activeValue?: FilterValue;
  onChange: (filter: string, value: string) => void;
}

const CART_STATUSES = {
  Active: TCartState.Active,
  Frozen: TCartState.Frozen,
  Merged: TCartState.Merged,
  Ordered: TCartState.Ordered,
};

const StatusFilterSection: FC<StatusFilterSectionProps> = ({
  activeValue,
  onChange,
  filter,
}) => {
  const intl = useIntl();
  return (
    <CollapsiblePanel
      header={
        <CollapsiblePanel.Header>
          {intl.formatMessage(messages.statusHeader)}
        </CollapsiblePanel.Header>
      }
    >
      <Spacings.Stack>
        {Object.values(CART_STATUSES).map((status) => {
          let tone: TTone = 'primary';
          switch (status) {
            case TCartState.Active:
              tone = 'primary';
              break;
            case TCartState.Merged:
              tone = 'secondary';
              break;
            case TCartState.Ordered:
              tone = 'information';
              break;
            case TCartState.Frozen:
              tone = 'warning';
              break;
          }

          return (
            <CheckboxInput
              key={status}
              name={status}
              isChecked={status === activeValue}
              onChange={() => onChange(filter.id, status)}
            >
              <FacetedFilterStatus
                tone={tone}
                label={status}
                isDisabled={false}
              />
            </CheckboxInput>
          );
        })}
      </Spacings.Stack>
    </CollapsiblePanel>
  );
};

export default StatusFilterSection;
