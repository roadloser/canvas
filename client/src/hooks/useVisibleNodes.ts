/**
 * 视口虚拟化 Hook - 只渲染可见节点
 */

import { useMemo } from 'react';
import type { CanvasNode, Viewport } from '@/types';
import { intersects } from '@/utils/geometry';

/**
 * 获取视口可见的节点
 */
export function useVisibleNodes(
  nodes: CanvasNode[],
  viewport: Viewport,
  containerSize: { width: number; height: number }
): CanvasNode[] {
  return useMemo(() => {
    // 计算视口边界框（画布坐标系）
    const viewportBounds = {
      x: -viewport.x / viewport.zoom,
      y: -viewport.y / viewport.zoom,
      width: containerSize.width / viewport.zoom,
      height: containerSize.height / viewport.zoom,
    };

    // 添加缓冲区（提前加载周边节点）
    const buffer = 100; // 100px 缓冲
    const bufferedBounds = {
      x: viewportBounds.x - buffer,
      y: viewportBounds.y - buffer,
      width: viewportBounds.width + buffer * 2,
      height: viewportBounds.height + buffer * 2,
    };

    // 过滤可见节点
    return nodes.filter((node) => {
      const nodeBounds = {
        x: node.position.x,
        y: node.position.y,
        width: node.size.width,
        height: node.size.height,
      };

      return intersects(nodeBounds, bufferedBounds);
    });
  }, [nodes, viewport.x, viewport.y, viewport.zoom, containerSize.width, containerSize.height]);
}
