/**
 * 画布核心类型定义
 */

import type { ReactElement } from 'react';

// ============= 基础类型 =============

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Point, Size {}

// ============= 画布节点 =============

export interface CanvasNode {
  id: string; // 唯一标识 (nanoid)
  type: string; // 节点类型 (由插件定义)
  position: Point; // 位置
  size: Size; // 尺寸
  rotation: number; // 旋转角度 (0-360)
  zIndex: number; // 图层顺序
  locked: boolean; // 锁定状态
  visible: boolean; // 可见性
  props: Record<string, unknown>; // 插件自定义属性
  children?: CanvasNode[]; // 子节点 (支持嵌套)
}

// ============= 文档模型 =============

export interface CanvasDocument {
  id: string;
  name: string;
  nodes: CanvasNode[]; // 根节点列表
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: string;
  };
}

// ============= 画布状态 =============

export interface Viewport {
  x: number; // 视口偏移X
  y: number; // 视口偏移Y
  zoom: number; // 缩放级别 (0.1 ~ 10)
}

export interface Selection {
  nodeIds: string[]; // 选中的节点ID
  mode: 'single' | 'multiple'; // 选择模式
}

export interface Cursor {
  mode: 'select' | 'pan' | 'draw'; // 光标模式
  tool?: string; // 当前工具
}

export interface CanvasState {
  viewport: Viewport;
  selection: Selection;
  cursor: Cursor;
}

// ============= 插件系统 =============

export interface RenderContext {
  isSelected: boolean; // 是否被选中
  isHovered: boolean; // 是否被悬停
  isEditing: boolean; // 是否处于编辑模式
  zoom: number; // 当前缩放级别

  // 回调函数
  onUpdate: (props: Partial<CanvasNode>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
}

export interface CanvasPlugin {
  // 元数据
  name: string; // 插件名称
  version: string; // 插件版本
  nodeType: string; // 负责的节点类型

  // 生命周期
  install?: (engine: unknown) => void; // 安装插件
  uninstall?: (engine: unknown) => void; // 卸载插件

  // 渲染能力
  render: (node: CanvasNode, context: RenderContext) => ReactElement;

  // 可选能力
  editor?: (node: CanvasNode) => ReactElement; // 属性编辑器
  toolbar?: () => ReactElement; // 工具栏按钮
  createNode?: (props?: Partial<CanvasNode>) => CanvasNode; // 默认节点
  onKeyDown?: (e: KeyboardEvent, node: CanvasNode) => void; // 快捷键
}

// ============= 命令模式 =============

export interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
  merge?(command: Command): boolean; // 合并连续命令
}

// ============= 事件系统 =============

export type CanvasEvents = {
  // 节点事件
  'node:created': { node: CanvasNode };
  'node:updated': { node: CanvasNode; changes: Partial<CanvasNode> };
  'node:deleted': { nodeId: string };

  // 选择事件
  'selection:changed': { nodeIds: string[] };

  // 视口事件
  'viewport:changed': { viewport: Viewport };

  // 历史事件
  'history:changed': { canUndo: boolean; canRedo: boolean };

  // 工具事件
  'tool:changed': { tool: string };
};
