/**
 * 插件注册中心
 */

import { useEditorStore } from '@/store/editorStore';
import { DrawPlugin } from './draw/DrawPlugin';
import { ImagePlugin } from './image/ImagePlugin';
import { ShapePlugin } from './shape/ShapePlugin';
import { TextPlugin } from './text/TextPlugin';

/**
 * 注册所有内置插件
 */
export function registerBuiltInPlugins(): void {
  const registerPlugin = useEditorStore.getState().registerPlugin;

  registerPlugin(TextPlugin);
  registerPlugin(ShapePlugin);
  registerPlugin(DrawPlugin);
  registerPlugin(ImagePlugin);
}

export { DrawPlugin } from './draw/DrawPlugin';
export { ImagePlugin } from './image/ImagePlugin';
export { ShapePlugin } from './shape/ShapePlugin';
export { TextPlugin } from './text/TextPlugin';
