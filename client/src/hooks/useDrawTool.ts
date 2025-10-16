/**
 * 绘制工具 Hook - 支持绘制矩形/圆形/手写
 */

import { nanoid } from 'nanoid';
import { useCallback, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import type { CanvasNode, Point } from '@/types';

export function useDrawTool(currentTool: string) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [drawingNodeId, setDrawingNodeId] = useState<string | null>(null);

  const addNode = useEditorStore((state) => state.addNode);
  const updateNode = useEditorStore((state) => state.updateNode);
  const deleteNode = useEditorStore((state) => state.deleteNode);

  // 开始绘制
  const startDrawing = useCallback(
    (point: Point) => {
      if (currentTool === 'select' || currentTool === 'pan') {
        return;
      }

      setIsDrawing(true);
      setStartPoint(point);

      // 创建临时节点
      const nodeId = nanoid();
      setDrawingNodeId(nodeId);

      let node: CanvasNode | null = null;

      if (currentTool === 'rectangle') {
        node = {
          id: nodeId,
          type: 'shape',
          position: point,
          size: { width: 1, height: 1 },
          rotation: 0,
          zIndex: 0,
          locked: false,
          visible: true,
          props: {
            shapeType: 'rectangle',
            fill: 'transparent', // 透明填充
            stroke: '#2563eb',
            strokeWidth: 2,
            cornerRadius: 0,
          },
        };
      } else if (currentTool === 'circle') {
        node = {
          id: nodeId,
          type: 'shape',
          position: point,
          size: { width: 1, height: 1 },
          rotation: 0,
          zIndex: 0,
          locked: false,
          visible: true,
          props: {
            shapeType: 'circle',
            fill: 'transparent', // 透明填充
            stroke: '#be185d',
            strokeWidth: 2,
          },
        };
      } else if (currentTool === 'draw') {
        node = {
          id: nodeId,
          type: 'draw',
          position: point,
          size: { width: 0, height: 0 },
          rotation: 0,
          zIndex: 0,
          locked: false,
          visible: true,
          props: {
            points: [[point.x, point.y, 0.5]],
            color: '#000000',
            strokeWidth: 2,
          },
        };
      }

      if (node) {
        addNode(node);
      }
    },
    [currentTool, addNode]
  );

  // 更新绘制
  const updateDrawing = useCallback(
    (point: Point) => {
      if (!(isDrawing && startPoint && drawingNodeId)) {
        return;
      }

      if (currentTool === 'rectangle') {
        // 矩形：从左上角到右下角
        const width = Math.abs(point.x - startPoint.x);
        const height = Math.abs(point.y - startPoint.y);
        const x = Math.min(point.x, startPoint.x);
        const y = Math.min(point.y, startPoint.y);

        updateNode(drawingNodeId, {
          position: { x, y },
          size: { width, height },
        });
      } else if (currentTool === 'circle') {
        // 椭圆：计算边界框（从起始点到当前点）
        const width = Math.abs(point.x - startPoint.x);
        const height = Math.abs(point.y - startPoint.y);
        // 左上角位置
        const x = Math.min(point.x, startPoint.x);
        const y = Math.min(point.y, startPoint.y);

        updateNode(drawingNodeId, {
          position: { x, y },
          size: { width, height },
        });
      } else if (currentTool === 'draw') {
        // 手写模式：添加新点
        const document = useEditorStore.getState().current;
        const node = document?.nodes.find((n) => n.id === drawingNodeId);
        if (node) {
          const oldPoints = (node.props.points as number[][]) || [];
          // 创建新数组，避免 Immer frozen 问题
          const newPoints = [...oldPoints, [point.x, point.y, 0.5]];
          updateNode(drawingNodeId, {
            props: { ...node.props, points: newPoints },
          });
        }
      }
    },
    [isDrawing, startPoint, drawingNodeId, currentTool, updateNode]
  );

  // 结束绘制
  const endDrawing = useCallback(() => {
    if (!(isDrawing && drawingNodeId)) {
      return;
    }

    // 如果尺寸太小，删除节点
    const document = useEditorStore.getState().current;
    const node = document?.nodes.find((n) => n.id === drawingNodeId);

    if (
      node &&
      (currentTool === 'rectangle' || currentTool === 'circle') &&
      (node.size.width < 5 || node.size.height < 5)
    ) {
      deleteNode(drawingNodeId);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setDrawingNodeId(null);
  }, [isDrawing, drawingNodeId, currentTool, deleteNode]);

  return {
    isDrawing,
    startDrawing,
    updateDrawing,
    endDrawing,
  };
}
