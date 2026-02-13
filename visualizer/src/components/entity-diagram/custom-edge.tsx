import { EdgeChange, EdgeProps, Edge, getBezierPath } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { ChangeEvent } from './hooks/types';

export interface CustomEdgeData extends Edge {
  data: {
    label?: string;
    toLabel?: string;
    trackLinkChange: (evt: ChangeEvent) => void;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

export const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // State for tracking which label is being edited
  const [editingLabel, setEditingLabel] = useState<'from' | 'to' | null>(null);
  const [labelText, setLabelText] = useState('');

  // Calculate positions for both labels
  const midPointX = sourceX + (targetX - sourceX) * 0.5;
  const midPointY = sourceY + (targetY - sourceY) * 0.5;
  const fromLabelX = sourceX + (midPointX - sourceX) * 0.75;
  const fromLabelY = sourceY + (midPointY - sourceY) * 0.75;
  const toLabelX = midPointX + (targetX - midPointX) * 0.25;
  const toLabelY = midPointY + (targetY - midPointY) * 0.25;

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!data.label && !data.toLabel) {
      // Update edge data with default labels
      data.label = 'Label';
      data.toLabel = 'Relation';

      // Notify about the changes
      data.trackLinkChange({
        type: 'linkTextChanged',
        key: id,
        oldText: '',
        newText: 'Label',
        isFromText: true,
      });
      data.trackLinkChange({
        type: 'linkTextChanged',
        key: id,
        oldText: '',
        newText: 'Relation',
        isFromText: false,
      });
    }
  };

  const handleLabelClick = (type: 'from' | 'to') => {
    setEditingLabel(type);
    setLabelText((type === 'from' ? data.label : data.toLabel) ?? '');
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'from' | 'to') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const oldText = (type === 'from' ? data.label : data.toLabel) ?? '';

      // Update edge data
      const evt: EdgeChange = {
        id,
        type: 'select',
        selected: true,
      };
      if (type === 'from') {
        data.label = labelText;
      } else {
        data.toLabel = labelText;
      }
      // onEdgesChange([evt]);

      // Use trackLinkChange from data
      data.trackLinkChange({
        type: 'linkTextChanged',
        key: id,
        oldText,
        newText: labelText,
        isFromText: type === 'from',
      });

      setEditingLabel(null);
    }
  };

  useEffect(() => {
    data.setIsEditing(editingLabel !== null);
  }, [editingLabel, data.setIsEditing]);

  return (
    <>
      <path
        id={`${id}-interaction`}
        className="react-flow__edge-interaction"
        d={edgePath}
        strokeWidth={20}
        fill="none"
        stroke="transparent"
        onDoubleClick={handleDoubleClick}
      />
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 3, // Make the visible edge wider
          stroke: selected ? '#1a192b' : '#b1b1b7', // Darker color when selected
          filter: selected ? 'drop-shadow(0 0 2px #1a192b)' : 'none',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        // markerEnd={markerEnd}
      />
      {/* From Label */}
      {data?.label && (
        <foreignObject
          x={fromLabelX - 50}
          y={fromLabelY - 10}
          width={100}
          height={20}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          {editingLabel === 'from' ? (
            <input
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'from')}
              className="w-full text-center text-sm border rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              autoFocus
              onBlur={() => setEditingLabel(null)}
            />
          ) : (
            <div onClick={() => handleLabelClick('from')}>{data.label}</div>
          )}
        </foreignObject>
      )}

      {/* To Label */}
      {data?.toLabel && (
        <foreignObject
          x={toLabelX - 50}
          y={toLabelY - 10}
          width={100}
          height={20}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          {editingLabel === 'to' ? (
            <input
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'to')}
              className="w-full text-center text-sm border rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              autoFocus
              onBlur={() => setEditingLabel(null)}
            />
          ) : (
            <div onClick={() => handleLabelClick('to')}>{data.toLabel}</div>
          )}
        </foreignObject>
      )}
    </>
  );
};
