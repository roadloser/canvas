/**
 * 形状节点组件 (Konva)
 */

import type Konva from 'konva';
import { type FC, memo, useEffect, useRef } from 'react';
import { Ellipse, Rect, Transformer } from 'react-konva';
import { useEditorStore } from '@/store/editorStore';
import type { CanvasNode, RenderContext } from '@/types';

interface ShapeNodeProps {
  node: CanvasNode;
  context: RenderContext;
}

const ShapeNodeComponent: FC<ShapeNodeProps> = ({ node, context }) => {
  const shapeRef = useRef<Konva.Rect | Konva.Ellipse>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const updateNode = useEditorStore((state) => state.updateNode);
  const shapeType = node.props.shapeType as string;

  // 拖拽结束更新位置
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const newX = e.target.x();
    const newY = e.target.y();

    // 椭圆的 x,y 是中心点，需要转换为左上角
    updateNode(node.id, {
      position: {
        x: shapeType === 'circle' ? newX - node.size.width / 2 : newX,
        y: shapeType === 'circle' ? newY - node.size.height / 2 : newY,
      },
    });
  };

  // 变换结束更新尺寸和旋转
  const handleTransformEnd = () => {
    const shape = shapeRef.current;
    if (!shape) {
      return;
    }

    const scaleX = shape.scaleX();
    const scaleY = shape.scaleY();

    shape.scaleX(1);
    shape.scaleY(1);

    const newWidth = Math.max(5, node.size.width * scaleX);
    const newHeight = Math.max(5, node.size.height * scaleY);

    // 椭圆变换后的 x,y 是中心点，需要转换为左上角
    const newX = shape.x() - (shapeType === 'circle' ? newWidth / 2 : 0);
    const newY = shape.y() - (shapeType === 'circle' ? newHeight / 2 : 0);

    updateNode(node.id, {
      position: {
        x: newX,
        y: newY,
      },
      size: {
        width: newWidth,
        height: newHeight,
      },
      rotation: shape.rotation(),
    });
  };

  // 选中时显示 Transformer
  useEffect(() => {
    if (context.isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [context.isSelected]);

  const commonProps = {
    draggable: !node.locked,
    fill: node.props.fill as string,
    onClick: () => {
      if (!context.isSelected) {
        useEditorStore.getState().selectNodes([node.id]);
      }
    },
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    rotation: node.rotation,
    stroke: node.props.stroke as string,
    strokeWidth: node.props.strokeWidth as number,
  };

  return (
    <>
      {shapeType === 'rectangle' && (
        <Rect
          ref={shapeRef as React.RefObject<Konva.Rect>}
          {...commonProps}
          cornerRadius={node.props.cornerRadius as number}
          height={node.size.height}
          width={node.size.width}
          x={node.position.x}
          y={node.position.y}
        />
      )}

      {shapeType === 'circle' && (
        <Ellipse
          ref={shapeRef as React.RefObject<Konva.Ellipse>}
          {...commonProps}
          height={node.size.height}
          radiusX={node.size.width / 2}
          radiusY={node.size.height / 2}
          width={node.size.width}
          x={node.position.x + node.size.width / 2}
          y={node.position.y + node.size.height / 2}
        />
      )}

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
export const ShapeNode = memo(
  ShapeNodeComponent,
  (prev, next) =>
    prev.node.id === next.node.id &&
    prev.node.position === next.node.position &&
    prev.node.size === next.node.size &&
    prev.node.rotation === next.node.rotation &&
    prev.node.props === next.node.props &&
    prev.context.isSelected === next.context.isSelected
);
