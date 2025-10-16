/**
 * 手写/绘制插件 (使用 perfect-freehand)
 */

import { nanoid } from 'nanoid';
import type { CanvasPlugin } from '@/types';
import { DrawNode } from './DrawNode';

export const DrawPlugin: CanvasPlugin = {
  name: 'draw',
  version: '1.0.0',
  nodeType: 'draw',

  createNode: (props) => ({
    id: nanoid(),
    type: 'draw',
    position: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    props: {
      points: [], // 绘制点集合 [x, y, pressure][]
      color: '#000000',
      strokeWidth: 2,
      ...props?.props,
    },
    ...props,
  }),

  render: (node, context) => {
    return <DrawNode context={context} node={node} />;
  },
};
