import { FC } from 'react';
import Label from '@commercetools-uikit/label';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import styled from '@emotion/styled';
import ItemBar from './ItemBar';
import { designTokens } from '@commercetools-uikit/design-system';

export interface Cluster {
  key: string;
  color: string;
  clusterLabel: string;
}

const ItemCircle = styled.div<{ circleColor?: string; isChecked: boolean }>`
  flex-shrink: 0;
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  border-radius: 1.2em;
  background-color: ${(props) =>
    props.isChecked
      ? props.circleColor || designTokens.colorPrimary85
      : 'white'};
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  margin-right: 0.2em;
  transition: var(--transition);
  border: 3px solid
    ${(props) => props.circleColor || designTokens.colorPrimary85};
`;

type Props = {
  label: string;
  itemKey: string;
  color?: string;
  filter: Record<string, boolean>;
  toggleItem: (item: string) => void;
  maxNodes: number;
  nodesCount: number;
  visibleNodesCount: number;
};

const PanelItem: FC<Props> = ({
  label,
  itemKey,
  color,
  filter,
  toggleItem,
  maxNodes,
  nodesCount,
  visibleNodesCount,
}) => {
  return (
    <Spacings.Inline>
      <input
        type="checkbox"
        checked={filter[itemKey] || false}
        onChange={() => toggleItem(itemKey)}
        id={`cluster-${itemKey}`}
        style={{ display: 'none' }}
      />
      <Label htmlFor={`cluster-${itemKey}`}>
        <ItemCircle circleColor={color} isChecked={filter[itemKey] || false} />{' '}
        <div>
          <Text.Body>{label}</Text.Body>
          <ItemBar
            maxNodes={maxNodes}
            nodesCount={nodesCount}
            visibleNodesCount={visibleNodesCount}
          />
        </div>
      </Label>
    </Spacings.Inline>
  );
};

export default PanelItem;
