/**
 * 手写节点组件 (使用 perfect-freehand)
 */

import { getStroke } from 'perfect-freehand';
import { type FC, useMemo } from 'react';
import { Line } from 'react-konva';
import type { CanvasNode, RenderContext } from '@/types';

interface DrawNodeProps {
  node: CanvasNode;
  context: RenderContext;
}

export const DrawNode: FC<DrawNodeProps> = ({ node }) => {
  // 使用 perfect-freehand 生成平滑路径
  const pathData = useMemo(() => {
    const points = node.props.points as number[][];
    if (!points || points.length === 0) {
      return [];
    }

    const stroke = getStroke(points, {
      size: (node.props.strokeWidth as number) || 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    // 转换为 Konva Line 的 points 格式
    return stroke.flatMap((point) => [point[0], point[1]]);
  }, [node.props.points, node.props.strokeWidth]);

  if (pathData.length === 0) {
    return null;
  }

  return (
    <Line
      closed
      fill={node.props.color as string}
      lineCap="round"
      lineJoin="round"
      points={pathData}
      stroke={node.props.color as string}
      strokeWidth={1}
      tension={0}
    />
  );
};
