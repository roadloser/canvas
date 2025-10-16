/**
 * 网格背景组件
 */

import { type FC, useMemo } from 'react';
import { Layer, Line } from 'react-konva';

interface GridBackgroundProps {
  width: number;
  height: number;
  gridSize?: number;
  color?: string;
}

export const GridBackground: FC<GridBackgroundProps> = ({
  width,
  height,
  gridSize = 20,
  color = '#e0e0e0',
}) => {
  // 生成网格线
  const lines = useMemo(() => {
    const result: Array<{ points: number[]; key: string }> = [];

    // 垂直线
    for (let i = 0; i <= width; i += gridSize) {
      result.push({
        points: [i, 0, i, height],
        key: `v-${i}`,
      });
    }

    // 水平线
    for (let i = 0; i <= height; i += gridSize) {
      result.push({
        points: [0, i, width, i],
        key: `h-${i}`,
      });
    }

    return result;
  }, [width, height, gridSize]);

  return (
    <Layer listening={false}>
      {lines.map((line) => (
        <Line key={line.key} opacity={0.5} points={line.points} stroke={color} strokeWidth={1} />
      ))}
    </Layer>
  );
};
