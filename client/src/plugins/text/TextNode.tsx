/**
 * 文本节点组件 (Konva)
 */

import type Konva from 'konva';
import { type FC, memo, useEffect, useRef, useState } from 'react';
import { Text, Transformer } from 'react-konva';
import { useEditorStore } from '@/store/editorStore';
import type { CanvasNode, RenderContext } from '@/types';

interface TextNodeProps {
  node: CanvasNode;
  context: RenderContext;
}

const TextNodeComponent: FC<TextNodeProps> = ({ node, context }) => {
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);

  const updateNode = useEditorStore((state) => state.updateNode);

  // 双击进入编辑模式
  const handleDblClick = () => {
    setIsEditing(true);
    context.onStartEdit();

    // TODO: 这里需要显示 DOM input 进行编辑
    // Konva 的文本编辑需要叠加 DOM 层
    // MVP 阶段暂时使用 prompt
    const newText = window.prompt('编辑文本:', node.props.text as string);
    if (newText !== null) {
      updateNode(node.id, {
        props: {
          ...node.props,
          text: newText,
        },
      });
    }

    setIsEditing(false);
    context.onEndEdit();
  };

  // 拖拽结束更新位置
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const newPos = {
      x: e.target.x(),
      y: e.target.y(),
    };

    updateNode(node.id, {
      position: newPos,
    });
  };

  // 变换结束更新尺寸和旋转
  const handleTransformEnd = () => {
    const textNode = textRef.current;
    if (!textNode) {
      return;
    }

    const scaleX = textNode.scaleX();
    const scaleY = textNode.scaleY();

    // 重置 scale,更新实际尺寸
    textNode.scaleX(1);
    textNode.scaleY(1);

    updateNode(node.id, {
      position: {
        x: textNode.x(),
        y: textNode.y(),
      },
      size: {
        width: Math.max(5, textNode.width() * scaleX),
        height: Math.max(5, textNode.height() * scaleY),
      },
      rotation: textNode.rotation(),
    });
  };

  // 选中时显示 Transformer
  useEffect(() => {
    if (context.isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [context.isSelected]);

  return (
    <>
      <Text
        align={node.props.textAlign as string}
        draggable={!(node.locked || isEditing)}
        fill={node.props.color as string}
        fontFamily={node.props.fontFamily as string}
        fontSize={node.props.fontSize as number}
        height={node.size.height}
        onClick={() => {
          if (!context.isSelected) {
            useEditorStore.getState().selectNodes([node.id]);
          }
        }}
        onDblClick={handleDblClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        ref={textRef}
        rotation={node.rotation}
        text={node.props.text as string}
        width={node.size.width}
        x={node.position.x}
        y={node.position.y}
      />

      {context.isSelected && !isEditing && (
        <Transformer
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
          ]}
          ref={transformerRef}
          rotateEnabled
        />
      )}
    </>
  );
};

// React.memo 优化 - 只在 node 或 context 变化时重新渲染
export const TextNode = memo(
  TextNodeComponent,
  (prev, next) =>
    prev.node.id === next.node.id &&
    prev.node.position === next.node.position &&
    prev.node.size === next.node.size &&
    prev.node.rotation === next.node.rotation &&
    prev.node.props === next.node.props &&
    prev.context.isSelected === next.context.isSelected
);
