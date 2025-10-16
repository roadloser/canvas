/**
 * 图片插件
 */

import { nanoid } from 'nanoid';
import type { CanvasPlugin } from '@/types';
import { ImageNode } from './ImageNode';

export const ImagePlugin: CanvasPlugin = {
  name: 'image',
  version: '1.0.0',
  nodeType: 'image',

  createNode: (props) => ({
    id: nanoid(),
    type: 'image',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 200 },
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    props: {
      src: '',
      objectFit: 'contain', // contain | cover
      ...props?.props,
    },
    ...props,
  }),

  render: (node, context) => {
    return <ImageNode context={context} node={node} />;
  },
};
