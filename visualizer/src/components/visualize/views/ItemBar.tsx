import { FC } from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';

export type Props = {
  maxNodes: number;
  nodesCount: number;
  visibleNodesCount: number;
};

const Bar = styled.div<{ barWidth: number }>`
  position: relative;
  background: ${designTokens.colorPrimary};
  height: 3px;
  margin-bottom: 0.2em;
  width: ${(props) => `${props.barWidth}% `};
`;

const InsideBar = styled.div<{ barWidth: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: ${designTokens.colorAccent};
  transition: var(--transition);
  width: ${(props) => `${props.barWidth}% `};
`;

const ItemBar: FC<Props> = ({ maxNodes, nodesCount, visibleNodesCount }) => {
  return (
    <Bar barWidth={(100 * nodesCount) / maxNodes}>
      <InsideBar barWidth={(100 * visibleNodesCount) / nodesCount} />
    </Bar>
  );
};

export default ItemBar;
