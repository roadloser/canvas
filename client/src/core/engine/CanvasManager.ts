/**
 * 画布管理器 - 视口控制
 */

import { useEditorStore } from '@/store/editorStore';
import type { Point, Viewport } from '@/types';

export class CanvasManager {
  /**
   * 平移到指定位置
   */
  panTo(x: number, y: number): void {
    useEditorStore.getState().setViewport({ x, y });
  }

  /**
   * 缩放到指定级别
   */
  zoomTo(level: number, center?: Point): void {
    const state = useEditorStore.getState();
    const viewport = state.viewport;

    if (center) {
      const oldZoom = viewport.zoom;
      const ratio = level / oldZoom;

      state.setViewport({
        x: center.x - (center.x - viewport.x) * ratio,
        y: center.y - (center.y - viewport.y) * ratio,
        zoom: level,
      });
    } else {
      state.setViewport({ zoom: level });
    }
  }

  /**
   * 屏幕坐标转画布坐标
   */
  screenToCanvas(point: Point): Point {
    const viewport = useEditorStore.getState().viewport;

    return {
      x: (point.x - viewport.x) / viewport.zoom,
      y: (point.y - viewport.y) / viewport.zoom,
    };
  }

  /**
   * 画布坐标转屏幕坐标
   */
  canvasToScreen(point: Point): Point {
    const viewport = useEditorStore.getState().viewport;

    return {
      x: point.x * viewport.zoom + viewport.x,
      y: point.y * viewport.zoom + viewport.y,
    };
  }

  /**
   * 获取当前视口
   */
  getViewport(): Viewport {
    return useEditorStore.getState().viewport;
  }

  /**
   * 重置视口
   */
  resetViewport(): void {
    useEditorStore.getState().setViewport({
      x: 0,
      y: 0,
      zoom: 1,
    });
  }

  /**
   * 适应屏幕 (将所有节点居中显示)
   */
  fitToScreen(containerWidth: number, containerHeight: number): void {
    const document = useEditorStore.getState().current;
    if (!document || document.nodes.length === 0) {
      return;
    }

    // 计算所有节点的边界框
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const node of document.nodes) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.size.width);
      maxY = Math.max(maxY, node.position.y + node.size.height);
    }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // 计算合适的缩放级别
    const scaleX = (containerWidth * 0.8) / contentWidth;
    const scaleY = (containerHeight * 0.8) / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1); // 最大不超过 1

    // 计算居中位置
    const centerX = containerWidth / 2 - ((minX + maxX) / 2) * scale;
    const centerY = containerHeight / 2 - ((minY + maxY) / 2) * scale;

    useEditorStore.getState().setViewport({
      x: centerX,
      y: centerY,
      zoom: scale,
    });
  }
}

// 导出单例
export const canvasManager = new CanvasManager();
