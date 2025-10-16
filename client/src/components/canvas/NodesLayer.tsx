/**
 * 节点渲染层（带虚拟化优化）
 */

import type { FC } from 'react';
import { Layer } from 'react-konva';
import { useVisibleNodes } from '@/hooks/useVisibleNodes';
import {
  useDocument,
  useEditorStore,
  usePluginRegistry,
  useSelection,
  useViewport,
} from '@/store/editorStore';
import type { CanvasNode } from '@/types';

interface NodesLayerProps {
  containerWidth?: number;
  containerHeight?: number;
}

export const NodesLayer: FC<NodesLayerProps> = ({
  containerWidth = 1920,
  containerHeight = 1080,
}) => {
  const document = useDocument();
  const pluginRegistry = usePluginRegistry();
  const selection = useSelection();
  const viewport = useViewport();

  // 虚拟化：只渲染可见节点
  const visibleNodes = useVisibleNodes(document?.nodes || [], viewport, {
    width: containerWidth,
    height: containerHeight,
  });

  if (!document) {
    return null;
  }

  return (
    <Layer>
      {visibleNodes.map((node) => (
        <NodeRenderer
          key={node.id}
          node={node}
          registry={pluginRegistry}
          selection={selection}
          viewport={viewport}
        />
      ))}
    </Layer>
  );
};

// 节点渲染器组件
interface NodeRendererProps {
  node: CanvasNode;
  registry: Map<string, import('@/types').CanvasPlugin>;
  selection: import('@/types').Selection;
  viewport: import('@/types').Viewport;
}

const NodeRenderer: FC<NodeRendererProps> = ({ node, registry, selection, viewport }) => {
  const plugin = registry.get(node.type);

  if (!(plugin && node.visible)) {
    return null;
  }

  const updateNode = useEditorStore.getState().updateNode;
  const deleteNode = useEditorStore.getState().deleteNode;
  const duplicateNode = useEditorStore.getState().duplicateNode;

  // 渲染上下文
  const context = {
    isSelected: selection.nodeIds.includes(node.id),
    isHovered: false,
    isEditing: false,
    zoom: viewport.zoom,
    onUpdate: (props: Partial<CanvasNode>) => {
      updateNode(node.id, props);
    },
    onDelete: () => {
      deleteNode(node.id);
    },
    onDuplicate: () => {
      duplicateNode(node.id);
    },
    onStartEdit: () => {
      // 编辑模式
    },
    onEndEdit: () => {
      // 结束编辑
    },
  };

  return <>{plugin.render(node, context)}</>;
};
