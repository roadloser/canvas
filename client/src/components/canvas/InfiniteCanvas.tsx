/**
 * 无限画布组件 (基于 react-konva)
 */

import type Konva from 'konva';
import { type FC, useEffect, useRef } from 'react';
import { Stage } from 'react-konva';
import { useDrawTool } from '@/hooks/useDrawTool';
import { useEditorStore } from '@/store/editorStore';

interface InfiniteCanvasProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export const InfiniteCanvas: FC<InfiniteCanvasProps> = ({ width, height, children }) => {
  const stageRef = useRef<Konva.Stage>(null);

  const viewport = useEditorStore((state) => state.viewport);
  const setViewport = useEditorStore((state) => state.setViewport);
  const cursorMode = useEditorStore((state) => state.cursor.mode);
  const currentTool = useEditorStore((state) => state.currentTool);

  // 绘制工具
  const { startDrawing, updateDrawing, endDrawing } = useDrawTool(currentTool);

  // 处理滚轮缩放
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const oldScale = viewport.zoom;
    const pointer = stage.getPointerPosition();

    if (!pointer) {
      return;
    }

    // 缩放因子
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // 限制缩放范围 0.1 ~ 10
    const clampedScale = Math.max(0.1, Math.min(10, newScale));

    // 计算新的位置,使缩放围绕鼠标位置
    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldScale,
      y: (pointer.y - viewport.y) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setViewport({
      x: newPos.x,
      y: newPos.y,
      zoom: clampedScale,
    });
  };

  // 处理拖拽平移 (手形工具 或 空格键)
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (isHandMode) {
      const stage = e.target as Konva.Stage;
      setViewport({
        x: stage.x(),
        y: stage.y(),
      });
      // 重置光标
      document.body.style.cursor = '';
    }
  };

  // 监听键盘事件 (空格键切换平移模式)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        useEditorStore.getState().setCursorMode('pan');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        useEditorStore.getState().setCursorMode('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 处理绘制工具的鼠标事件
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (currentTool !== 'select' && currentTool !== 'hand' && !isHandMode) {
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const pos = stage.getRelativePointerPosition();
      if (pos) {
        startDrawing(pos);
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (currentTool !== 'select' && currentTool !== 'hand' && !isHandMode) {
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const pos = stage.getRelativePointerPosition();
      if (pos) {
        updateDrawing(pos);
      }
    }
  };

  const handleMouseUp = () => {
    if (currentTool !== 'select' && currentTool !== 'hand' && !isHandMode) {
      endDrawing();
    }
  };

  const isHandMode = currentTool === 'hand' || cursorMode === 'pan';

  return (
    <div
      className="infinite-canvas-container relative h-full w-full overflow-hidden bg-gray-50"
      style={{ cursor: isHandMode ? 'grab' : 'default' }}
    >
      <Stage
        draggable={isHandMode}
        height={height}
        onDragEnd={handleDragEnd}
        onDragStart={() => {
          // 拖拽时显示 grabbing 光标
          if (isHandMode) {
            document.body.style.cursor = 'grabbing';
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        ref={stageRef}
        scaleX={viewport.zoom}
        scaleY={viewport.zoom}
        width={width}
        x={viewport.x}
        y={viewport.y}
      >
        {children}
      </Stage>
    </div>
  );
};
