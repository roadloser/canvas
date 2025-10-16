/**
 * 画布编辑器主页面
 */

import { type FC, useEffect, useRef, useState } from 'react';
import { GridBackground } from '@/components/canvas/GridBackground';
import { InfiniteCanvas } from '@/components/canvas/InfiniteCanvas';
import { NodesLayer } from '@/components/canvas/NodesLayer';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { useKeyboard } from '@/hooks/useKeyboard';
import { registerBuiltInPlugins } from '@/plugins';
import { useEditorStore } from '@/store/editorStore';

export const CanvasEditor: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const showGrid = useEditorStore((state) => state.showGrid);

  // 键盘快捷键
  useKeyboard();

  // 初始化插件
  useEffect(() => {
    registerBuiltInPlugins();
  }, []);

  // 响应式画布尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div className="flex h-screen w-full flex-col">
      <Toolbar />
      <div className="flex-1" ref={containerRef}>
        <InfiniteCanvas height={dimensions.height} width={dimensions.width}>
          {showGrid && (
            <GridBackground height={dimensions.height * 10} width={dimensions.width * 10} />
          )}
          <NodesLayer containerHeight={dimensions.height} containerWidth={dimensions.width} />
        </InfiniteCanvas>
      </div>
    </div>
  );
};
