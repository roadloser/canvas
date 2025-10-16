/**
 * 文本插件
 */

import { nanoid } from 'nanoid';
import type { CanvasPlugin } from '@/types';
import { TextNode } from './TextNode';

export const TextPlugin: CanvasPlugin = {
  name: 'text',
  version: '1.0.0',
  nodeType: 'text',

  createNode: (props) => ({
    id: nanoid(),
    type: 'text',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 100 },
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    props: {
      text: 'Double click to edit',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      color: '#000000',
      textAlign: 'left',
      ...props?.props,
    },
    ...props,
  }),

  render: (node, context) => {
    return <TextNode context={context} node={node} />;
  },
};
