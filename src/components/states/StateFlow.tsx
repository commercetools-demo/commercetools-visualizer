import PrimaryButton from '@commercetools-uikit/primary-button';
import dagre from 'dagre';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';

import { FC, useCallback, useState } from 'react';
// eslint-disable-next-line import/no-named-as-default
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Node,
  Edge,
  Background,
  Controls,
} from 'reactflow';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { TState } from '../../types/generated/ctp';
import 'reactflow/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: Array<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: Array<any>,
  direction = 'TB'
) => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

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
}

const StateFlow: FC<Props> = ({ items }) => {
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const [isHorizontal, setHorizontal] = useState<boolean>(false);
  const initialNodes: Array<Node> = items.map((item) => {
    let type = '';
    if (item.initial) {
      type = 'input';
    } else if (item.transitions === undefined) {
      type = 'output';
    }
    const result: Node = {
      id: item.id,
      data: {
        label:
          formatLocalizedString(
            {
              name: transformLocalizedFieldToLocalizedString(
                item.nameAllLocales ?? []
              ),
            },
            {
              key: 'name',
              locale: dataLocale,
              fallbackOrder: projectLanguages,
              fallback: NO_VALUE_FALLBACK,
            }
          ) || item.key,
        // description: formatLocalizedString(
        //   {
        //     name: transformLocalizedFieldToLocalizedString(
        //       item.descriptionAllLocales ?? []
        //     ),
        //   },
        //   {
        //     key: 'name',
        //     locale: dataLocale,
        //     fallbackOrder: projectLanguages,
        //     fallback: NO_VALUE_FALLBACK,
        //   }
        // ),
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

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
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
  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      isHorizontal ? 'TB' : 'LR'
    );
    setHorizontal(!isHorizontal);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges, isHorizontal]);

  return (
    <div>
      <div style={{ height: '400px', width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div>
        <PrimaryButton
          onClick={() => onLayout()}
          label={isHorizontal ? 'horizontal layout' : 'vertical layout'}
        ></PrimaryButton>
      </div>
    </div>
  );
};

export default StateFlow;
