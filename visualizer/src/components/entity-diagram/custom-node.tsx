import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { NodeEntity } from './hooks/types';

export interface CustomNodeType extends Node {
  data: {
    label: string;
    items: NodeEntity['items'];
    inheritedItems: NodeEntity['inheritedItems'];
  };
}

export const CustomNode: React.FC<NodeProps<CustomNodeType>> = ({ data }) => {
  const nodeColor = data.items?.[0]?.color;
  return (
    <div
      style={{
        backgroundColor: 'white',
        border: nodeColor ? `solid 2px ${nodeColor}` : undefined,
        padding: '10px 5px',
        minWidth: '150px',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: '10px', height: '10px' }} />
      <Handle type="source" position={Position.Bottom} style={{ width: '10px', height: '10px' }} />

      {/* Node Title */}
      <h3 style={{ textAlign: 'center', margin: '10px 0 0 10px' }}>{data.label}</h3>

      {/* Items Section */}
      {data.items && data.items.length > 0 && (
        <div className="border-t pt-2" style={{ padding: '0 10px', paddingTop: '15px' }}>
          <span style={{ fontWeight: 500 }}>Attributes</span>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {data.items.map((item, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', padding: '0 5px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    marginRight: '5px',
                    backgroundColor: item.color,
                  }}
                />
                <span className={`text-sm ${item.iskey ? 'italic' : ''}`}>
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Items Section */}
      {data.inheritedItems && data.inheritedItems.length > 0 && (
        <div style={{ padding: '0 10px', paddingTop: '15px' }}>
          <span style={{ fontWeight: 500 }}>Inherited Attributes</span>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {data.inheritedItems.map((item, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', padding: '0 5px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    marginRight: '5px',
                    backgroundColor: 'black',
                  }}
                />
                <span className={`text-sm`}>
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
