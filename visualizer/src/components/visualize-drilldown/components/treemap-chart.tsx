import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import * as d3 from 'd3';
import { TreemapNode, EntityType, VisualizationConfig } from '../types';
import { DEFAULT_COLORS } from '../utils/relationship-contstants';
import { useEntityFetcher } from '../hooks/use-entity-fetcher';
import messages from '../messages';

interface TreemapChartProps {
  data: TreemapNode[];
  config: VisualizationConfig;
  onNodeClick: (node: TreemapNode) => void;
  onNodeHover?: (node: TreemapNode | null) => void;
}

export const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  config,
  onNodeClick,
  onNodeHover,
}) => {
  const intl = useIntl();
  const { extractName } = useEntityFetcher();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const { width, height, padding } = config;
    const colors = { ...DEFAULT_COLORS, ...config.colors };

    // Create hierarchy from flat data
    const root = d3
      .hierarchy({ children: data } as any)
      .sum((d: any) => d.value || 1)
      .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

    // Create treemap layout
    const treemap = d3
      .treemap()
      .size([width - 2 * padding, height - 2 * padding])
      .padding(2)
      .round(true);

    treemap(root as any);

    // Create container group
    const container = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    // Create leaf nodes
    const leaf = container
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    leaf
      .append('rect')
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', (d: any) => {
        const entityType = d.data?.entityType;
        const isLoadMore = d.data?.id?.startsWith('load-more-');

        if (isLoadMore) {
          return '#f0f0f0'; // Light gray for load more nodes
        }

        return entityType
          ? colors[entityType as EntityType] || '#cccccc'
          : '#cccccc';
      })
      .attr('stroke', (d: any) => {
        const isLoadMore = d.data?.id?.startsWith('load-more-');
        return isLoadMore ? '#999999' : '#ffffff';
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d: any) => {
        const isLoadMore = d.data?.id?.startsWith('load-more-');
        return isLoadMore ? '4,4' : 'none';
      })
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', 'pointer')
      .style('opacity', (d: any) => {
        const isLoadMore = d.data?.id?.startsWith('load-more-');
        return isLoadMore ? 0.6 : 0.8;
      })
      .on('mouseover', function (event: any, d: any) {
        const isLoadMore = d.data?.id?.startsWith('load-more-');
        d3.select(this).style('opacity', isLoadMore ? 0.8 : 1);

        const name = extractName(d.data);

        let content = isLoadMore
          ? intl.formatMessage(messages.loadMoreTooltip, {
              entityType:
                d.data?.entityType || intl.formatMessage(messages.items),
            })
          : intl.formatMessage(messages.entityTooltip, {
              name,
              entityType:
                d.data?.entityType ||
                intl.formatMessage(messages.unknownEntityType),
            });

        // Add additional data to tooltip if available
        if (!isLoadMore && d.data?.additionalData) {
          content += `\n${d.data.additionalData}`;
        }

        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY - 10,
          content,
        });

        if (d.data) {
          onNodeHover?.(d.data);
        }
      })
      .on('mouseout', function (event: any, d: any) {
        const isLoadMore = d.data?.id?.startsWith('load-more-');
        d3.select(this).style('opacity', isLoadMore ? 0.6 : 0.8);
        setTooltip((prev) => ({ ...prev, visible: false }));
        onNodeHover?.(null);
      })
      .on('click', function (event: any, d: any) {
        event.stopPropagation();
        if (d.data) {
          onNodeClick(d.data);
        }
      });

    // Add text labels
    leaf
      .append('text')
      .attr('x', (d: any) => (d.x1 - d.x0) / 2)
      .attr('y', (d: any) => (d.y1 - d.y0) / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', (d: any) => {
        const isLoadMore = d.data?.id?.startsWith('load-more-');
        return isLoadMore ? '#666666' : '#ffffff';
      })
      .style('font-size', (d: any) => {
        const isLoadMore = d.data?.id?.startsWith('load-more-');
        return isLoadMore ? '20px' : '12px';
      })
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('text-shadow', (d: any) => {
        const isLoadMore = d.data?.id?.startsWith('load-more-');
        return isLoadMore ? 'none' : '1px 1px 2px rgba(0,0,0,0.7)';
      })
      .each(function (d: any) {
        const text = d3.select(this);
        const rectWidth = d.x1 - d.x0;
        const rectHeight = d.y1 - d.y0;
        const isLoadMore = d.data?.id?.startsWith('load-more-');

        // Handle load more nodes differently
        if (isLoadMore) {
          if (rectWidth > 30 && rectHeight > 30) {
            text.text('...');
          }
          return;
        }

        // Only show text if rectangle is large enough
        if (rectWidth > 60 && rectHeight > 30 && d.data?.name) {
          let name = d.data.name;
          name = extractName(d.data);

          // Check if we have additional data to display
          const hasAdditionalData = d.data.additionalData;
          const lineHeight = 14;

          if (hasAdditionalData && rectHeight > 50) {
            // Display name and additional data in two lines
            text.text('');

            // Add entity name on first line
            const nameTspan = text
              .append('tspan')
              .attr('x', rectWidth / 2)
              .attr('dy', -lineHeight / 2)
              .style('font-weight', 'bold')
              .text(name);

            // Truncate name if too long
            const nameLength = nameTspan.node()?.getComputedTextLength() || 0;
            if (nameLength > rectWidth - 10) {
              const truncatedName =
                name.length > 15 ? name.substring(0, 15) + '...' : name;
              nameTspan.text(truncatedName);
            }

            // Add additional data on second line
            if (hasAdditionalData) {
              d.data.additionalData.split('\n').forEach((line: string) => {
                text
                  .append('tspan')
                  .attr('x', rectWidth / 2)
                  .attr('dy', lineHeight)
                  .style('font-weight', 'normal')
                  .style('font-size', '10px')
                  .style('opacity', '0.9')
                  .text(line);
              });
            }
          } else {
            // Single line display (original behavior)
            text.text(name);

            // Wrap text if too long
            const textLength = text.node()?.getComputedTextLength() || 0;
            if (textLength > rectWidth - 10) {
              const words = name.split(' ');
              text.text('');

              let line = '';

              words.forEach((word: string) => {
                const testLine = line + word + ' ';
                text.text(testLine);
                const testLength = text.node()?.getComputedTextLength() || 0;

                if (testLength > rectWidth - 10 && line !== '') {
                  text.text(line.trim());
                  text
                    .append('tspan')
                    .attr('x', rectWidth / 2)
                    .attr('dy', lineHeight)
                    .text(word);
                  line = word + ' ';
                } else {
                  line = testLine;
                }
              });

              if (line.trim()) {
                text.text(line.trim());
              }
            }
          }
        }
      });
  }, [data, config, onNodeClick, onNodeHover, intl]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} />
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            transform: 'translate(-50%, -100%)',
            whiteSpace: 'pre-line',
            maxWidth: '250px',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};
