/**
 * 事件总线 (使用 mitt)
 */

import mitt, { type Emitter } from 'mitt';
import type { CanvasEvents } from '@/types';

// 创建事件总线实例
export const eventBus: Emitter<CanvasEvents> = mitt<CanvasEvents>();

// 便捷方法
export const emit = eventBus.emit;
export const on = eventBus.on;
export const off = eventBus.off;
