import dagre from 'dagre';

import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';

import { FC, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Node,
  Edge,
  Background,
  Controls,
} from '@xyflow/react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { TState } from '../../../types/generated/ctp';
import '@xyflow/react/dist/style.css';
import { formatLocalizedString } from '../../../utils/format-localized-string';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: Array<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: Array<any>
) => {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

interface Props {
  items: Array<TState>;
  onNodeClick?: (id: string) => void;
}

const StateFlow: FC<Props> = ({ items, onNodeClick }) => {
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const initialNodes: Array<Node> = items.map((item) => {
    let type = '';
    if (item.initial) {
      type = 'input';
    } else if (!item.transitions || item.transitions.length === 0) {
      // No outgoing transitions => terminal (leaf) state.
      type = 'output';
    }
    const result: Node = {
      id: item.id,
      data: {
        label:
          formatLocalizedString(
            item.nameAllLocales ?? [],
            dataLocale,
            projectLanguages,
            NO_VALUE_FALLBACK
          ) || item.key,
      },
      type: type,
      position: { x: 0, y: 0 },
    };
    return result;
  });

  const initialEdges: Array<Edge> = [];
  items.forEach((item) => {
    item.transitions?.forEach((transition) => {
      const edge: Edge = {
        id: item.id + transition.id,
        source: item.id,
        target: transition.id,
        animated: true,
      };
      initialEdges.push(edge);
    });
  });

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params: any) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    [setEdges]
  );

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        onNodeClick={
          onNodeClick ? (_event, node) => onNodeClick(node.id) : undefined
        }
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default StateFlow;
