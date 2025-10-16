/**
 * 形状插件
 */

import { nanoid } from 'nanoid';
import type { CanvasPlugin } from '@/types';
import { ShapeNode } from './ShapeNode';

export const ShapePlugin: CanvasPlugin = {
  name: 'shape',
  version: '1.0.0',
  nodeType: 'shape',

  createNode: (props) => ({
    id: nanoid(),
    type: 'shape',
    position: { x: 200, y: 200 },
    size: { width: 100, height: 100 },
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    props: {
      shapeType: 'rectangle', // rectangle | circle
      fill: '#cccccc',
      stroke: '#000000',
      strokeWidth: 2,
      cornerRadius: 0,
      ...props?.props,
    },
    ...props,
  }),

  render: (node, context) => {
    return <ShapeNode context={context} node={node} />;
  },
};
