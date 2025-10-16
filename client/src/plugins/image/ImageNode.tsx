/**
 * 图片节点组件 (Konva)
 */

import type Konva from 'konva';
import { type FC, memo, useEffect, useRef, useState } from 'react';
import { Image as KonvaImage, Transformer } from 'react-konva';
import { useEditorStore } from '@/store/editorStore';
import type { CanvasNode, RenderContext } from '@/types';

interface ImageNodeProps {
  node: CanvasNode;
  context: RenderContext;
}

const ImageNodeComponent: FC<ImageNodeProps> = ({ node, context }) => {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const updateNode = useEditorStore((state) => state.updateNode);

  // 加载图片
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = node.props.src as string;
    img.onload = () => {
      setImage(img);
    };
  }, [node.props.src]);

  // 拖拽结束更新位置
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateNode(node.id, {
      position: {
        x: e.target.x(),
        y: e.target.y(),
      },
    });
  };

  // 变换结束更新尺寸和旋转
  const handleTransformEnd = () => {
    const imgNode = imageRef.current;
    if (!imgNode) {
      return;
    }

    const scaleX = imgNode.scaleX();
    const scaleY = imgNode.scaleY();

    imgNode.scaleX(1);
    imgNode.scaleY(1);

    updateNode(node.id, {
      position: {
        x: imgNode.x(),
        y: imgNode.y(),
      },
      size: {
        width: Math.max(5, imgNode.width() * scaleX),
        height: Math.max(5, imgNode.height() * scaleY),
      },
      rotation: imgNode.rotation(),
    });
  };

  // 选中时显示 Transformer
  useEffect(() => {
    if (context.isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [context.isSelected]);

  if (!image) {
    return null;
  }

  return (
    <>
      <KonvaImage
        draggable={!node.locked}
        height={node.size.height}
        image={image}
        onClick={() => {
          if (!context.isSelected) {
            useEditorStore.getState().selectNodes([node.id]);
          }
        }}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        ref={imageRef}
        rotation={node.rotation}
        width={node.size.width}
        x={node.position.x}
        y={node.position.y}
      />

      {context.isSelected && (
        <Transformer
          boundBoxFunc={(oldBox, newBox) => {
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
            'top-center',
            'bottom-center',
          ]}
          ref={transformerRef}
          rotateEnabled
        />
      )}
    </>
  );
};

// React.memo 优化
export const ImageNode = memo(
  ImageNodeComponent,
  (prev, next) =>
    prev.node.id === next.node.id &&
    prev.node.position === next.node.position &&
    prev.node.size === next.node.size &&
    prev.node.rotation === next.node.rotation &&
    prev.node.props.src === next.node.props.src &&
    prev.context.isSelected === next.context.isSelected
);
