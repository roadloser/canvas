/**
 * 工具栏组件
 */

import { type FC, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { ImageUploader } from './ImageUploader';

export const Toolbar: FC = () => {
  const [showImageUploader, setShowImageUploader] = useState(false);
  const currentTool = useEditorStore((state) => state.currentTool);
  const setCurrentTool = useEditorStore((state) => state.setCurrentTool);
  const addNode = useEditorStore((state) => state.addNode);
  const getPlugin = useEditorStore((state) => state.getPlugin);
  const showGrid = useEditorStore((state) => state.showGrid);
  const toggleGrid = useEditorStore((state) => state.toggleGrid);
  const viewport = useEditorStore((state) => state.viewport);
  const setViewport = useEditorStore((state) => state.setViewport);

  // 添加文本节点
  const handleAddText = () => {
    const textPlugin = getPlugin('text');
    if (textPlugin?.createNode) {
      const newNode = textPlugin.createNode({
        position: {
          x: (-viewport.x + 400) / viewport.zoom,
          y: (-viewport.y + 300) / viewport.zoom,
        },
      });
      addNode(newNode);
    }
  };

  // 添加矩形
  const handleAddRect = () => {
    const shapePlugin = getPlugin('shape');
    if (shapePlugin?.createNode) {
      const newNode = shapePlugin.createNode({
        position: {
          x: (-viewport.x + 400) / viewport.zoom,
          y: (-viewport.y + 300) / viewport.zoom,
        },
        props: { shapeType: 'rectangle', fill: '#4a90e2' },
      });
      addNode(newNode);
    }
  };

  // 添加圆形
  const handleAddCircle = () => {
    const shapePlugin = getPlugin('shape');
    if (shapePlugin?.createNode) {
      const newNode = shapePlugin.createNode({
        position: {
          x: (-viewport.x + 400) / viewport.zoom,
          y: (-viewport.y + 300) / viewport.zoom,
        },
        props: { shapeType: 'circle', fill: '#e24a90' },
      });
      addNode(newNode);
    }
  };

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center gap-2 border-gray-200 border-b bg-white px-4 shadow-sm">
      {/* 工具按钮组 */}
      <div className="flex items-center gap-1 border-gray-200 border-r pr-3">
        <button
          className={`rounded px-3 py-2 font-medium text-sm transition-colors ${
            currentTool === 'select'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => {
            setCurrentTool('select');
            useEditorStore.getState().setCursorMode('select');
          }}
          title="选择工具 (V)"
          type="button"
        >
          ↖
        </button>

        <button
          className={`rounded px-3 py-2 font-medium text-sm transition-colors ${
            currentTool === 'hand' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => {
            setCurrentTool('hand');
            useEditorStore.getState().setCursorMode('pan');
          }}
          title="手形工具 - 拖拽视图 (H 或空格)"
          type="button"
        >
          ✋
        </button>

        <button
          className="rounded px-3 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-100"
          onClick={handleAddText}
          title="添加文本 (T)"
          type="button"
        >
          T
        </button>

        <button
          className="rounded px-3 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-100"
          onClick={handleAddRect}
          title="添加矩形 (R)"
          type="button"
        >
          ▭
        </button>

        <button
          className="rounded px-3 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-100"
          onClick={handleAddCircle}
          title="添加圆形 (C)"
          type="button"
        >
          ○
        </button>

        <button
          className={`rounded px-3 py-2 font-medium text-sm transition-colors ${
            currentTool === 'rectangle'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setCurrentTool('rectangle')}
          title="绘制矩形模式 (拖拽创建)"
          type="button"
        >
          ▭↗
        </button>

        <button
          className={`rounded px-3 py-2 font-medium text-sm transition-colors ${
            currentTool === 'circle'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setCurrentTool('circle')}
          title="绘制圆形模式 (拖拽创建)"
          type="button"
        >
          ○↗
        </button>

        <button
          className={`rounded px-3 py-2 font-medium text-sm transition-colors ${
            currentTool === 'draw' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setCurrentTool('draw')}
          title="手写工具 (P)"
          type="button"
        >
          ✎
        </button>

        <button
          className="rounded px-3 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-100"
          onClick={() => setShowImageUploader(true)}
          title="上传图片 (I)"
          type="button"
        >
          🖼
        </button>
      </div>

      {/* 缩放控制 */}
      <div className="flex items-center gap-2 border-gray-200 border-r pr-3">
        <button
          className="rounded px-2 py-1 text-gray-700 transition-colors hover:bg-gray-100"
          onClick={() => {
            const newZoom = Math.max(0.1, viewport.zoom - 0.1);
            setViewport({ zoom: newZoom });
          }}
          title="缩小"
          type="button"
        >
          −
        </button>

        <span className="min-w-12 text-center text-gray-600 text-sm">
          {Math.round(viewport.zoom * 100)}%
        </span>

        <button
          className="rounded px-2 py-1 text-gray-700 transition-colors hover:bg-gray-100"
          onClick={() => {
            const newZoom = Math.min(10, viewport.zoom + 0.1);
            setViewport({ zoom: newZoom });
          }}
          title="放大"
          type="button"
        >
          +
        </button>

        <button
          className="rounded px-2 py-1 text-gray-600 text-xs transition-colors hover:bg-gray-100"
          onClick={() => setViewport({ zoom: 1 })}
          title="重置缩放 (Cmd+0)"
          type="button"
        >
          100%
        </button>
      </div>

      {/* 网格切换 */}
      <div className="flex items-center gap-2 border-gray-200 border-r pr-3">
        <button
          className={`rounded px-3 py-2 font-medium text-sm transition-colors ${
            showGrid ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={toggleGrid}
          title="切换网格"
          type="button"
        >
          #
        </button>
      </div>

      {/* 项目标题 */}
      <div className="flex-1 text-center">
        <h1 className="font-medium text-gray-700 text-sm">Figma Canvas MVP</h1>
      </div>

      {/* 图片上传弹窗 */}
      {showImageUploader && <ImageUploader onClose={() => setShowImageUploader(false)} />}
    </div>
  );
};
