/**
 * 编辑器主状态管理 (Zustand + Immer)
 */

import { enableMapSet } from 'immer';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  CanvasDocument,
  CanvasNode,
  CanvasPlugin,
  Cursor,
  Selection,
  Viewport,
} from '@/types';
import { indexedDBStorage } from '@/utils/indexedDBStorage';

// 启用 Immer MapSet 支持
enableMapSet();

// ============= State 接口 =============

interface DocumentSlice {
  current: CanvasDocument | null;
  // Actions
  loadDocument: (doc: CanvasDocument) => void;
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, props: Partial<CanvasNode>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
}

interface CanvasSlice {
  viewport: Viewport;
  selection: Selection;
  cursor: Cursor;
  // Actions
  setViewport: (viewport: Partial<Viewport>) => void;
  panBy: (delta: { x: number; y: number }) => void;
  zoomBy: (delta: number, center?: { x: number; y: number }) => void;
  selectNodes: (nodeIds: string[]) => void;
  deselectAll: () => void;
  setCursorMode: (mode: Cursor['mode']) => void;
}

interface UISlice {
  showGrid: boolean;
  showRulers: boolean;
  currentTool: string;
  // Actions
  toggleGrid: () => void;
  toggleRulers: () => void;
  setCurrentTool: (tool: string) => void;
}

interface PluginSlice {
  registry: Map<string, CanvasPlugin>;
  // Actions
  registerPlugin: (plugin: CanvasPlugin) => void;
  getPlugin: (type: string) => CanvasPlugin | undefined;
}

type EditorState = DocumentSlice & CanvasSlice & UISlice & PluginSlice;

// ============= 辅助函数 =============

/**
 * 在节点树中查找节点
 */
function findNodeInTree(nodes: CanvasNode[], targetId: string): CanvasNode | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node;
    }
    if (node.children) {
      const found = findNodeInTree(node.children, targetId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

// ============= Store 创建 =============

export const useEditorStore = create<EditorState>()(
  persist(
    devtools(
      immer((set, get) => ({
        // ========== Document Slice ==========
        current: {
          id: nanoid(),
          name: '未命名文档',
          nodes: [],
          metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: '1.0.0',
          },
        },

        loadDocument: (doc) =>
          set((state) => {
            state.current = doc;
          }),

        addNode: (node) =>
          set((state) => {
            if (state.current) {
              state.current.nodes.push(node);
              state.current.metadata.updatedAt = Date.now();
            }
          }),

        updateNode: (id, props) =>
          set((state) => {
            if (!state.current) {
              return;
            }

            const findAndUpdate = (nodes: CanvasNode[]): boolean => {
              for (const node of nodes) {
                if (node.id === id) {
                  Object.assign(node, props);
                  return true;
                }
                if (node.children && findAndUpdate(node.children)) {
                  return true;
                }
              }
              return false;
            };

            if (findAndUpdate(state.current.nodes)) {
              state.current.metadata.updatedAt = Date.now();
            }
          }),

        deleteNode: (id) =>
          set((state) => {
            if (!state.current) {
              return;
            }

            const filterNodes = (nodes: CanvasNode[]): CanvasNode[] => {
              return nodes.filter((node) => {
                if (node.id === id) {
                  return false;
                }
                if (node.children) {
                  node.children = filterNodes(node.children);
                }
                return true;
              });
            };

            state.current.nodes = filterNodes(state.current.nodes);
            state.current.metadata.updatedAt = Date.now();
          }),

        duplicateNode: (id) =>
          set((state) => {
            if (!state.current) {
              return;
            }

            const node = findNodeInTree(state.current.nodes, id);
            if (node) {
              const duplicate = {
                ...node,
                id: nanoid(),
                position: {
                  x: node.position.x + 20,
                  y: node.position.y + 20,
                },
              };
              state.current.nodes.push(duplicate);
              state.current.metadata.updatedAt = Date.now();
            }
          }),

        // ========== Canvas Slice ==========
        viewport: {
          x: 0,
          y: 0,
          zoom: 1,
        },

        selection: {
          nodeIds: [],
          mode: 'single',
        },

        cursor: {
          mode: 'select',
        },

        setViewport: (viewport) =>
          set((state) => {
            Object.assign(state.viewport, viewport);
          }),

        panBy: (delta) =>
          set((state) => {
            state.viewport.x += delta.x;
            state.viewport.y += delta.y;
          }),

        zoomBy: (delta, center) =>
          set((state) => {
            const oldZoom = state.viewport.zoom;
            const newZoom = Math.max(0.1, Math.min(10, oldZoom + delta));

            if (center) {
              // 缩放到中心点
              const ratio = newZoom / oldZoom;
              state.viewport.x = center.x - (center.x - state.viewport.x) * ratio;
              state.viewport.y = center.y - (center.y - state.viewport.y) * ratio;
            }

            state.viewport.zoom = newZoom;
          }),

        selectNodes: (nodeIds) =>
          set((state) => {
            state.selection.nodeIds = nodeIds;
            state.selection.mode = nodeIds.length > 1 ? 'multiple' : 'single';
          }),

        deselectAll: () =>
          set((state) => {
            state.selection.nodeIds = [];
          }),

        setCursorMode: (mode) =>
          set((state) => {
            state.cursor.mode = mode;
          }),

        // ========== UI Slice ==========
        showGrid: true,
        showRulers: false,
        currentTool: 'select',

        toggleGrid: () =>
          set((state) => {
            state.showGrid = !state.showGrid;
          }),

        toggleRulers: () =>
          set((state) => {
            state.showRulers = !state.showRulers;
          }),

        setCurrentTool: (tool) =>
          set((state) => {
            state.currentTool = tool;
          }),

        // ========== Plugin Slice ==========
        registry: new Map(),

        registerPlugin: (plugin) =>
          set((state) => {
            state.registry.set(plugin.nodeType, plugin);
          }),

        getPlugin: (type) => {
          return get().registry.get(type);
        },
      }))
    ),
    {
      name: 'figma-canvas-storage',
      storage: indexedDBStorage, // 使用 IndexedDB 替代 LocalStorage
      partialize: (state) => ({
        current: state.current, // 只持久化文档数据
        viewport: state.viewport, // 持久化视口状态
        // 不持久化 registry (Map 无法序列化)
        // 不持久化 UI 状态
      }),
      version: 1,
    }
  )
);

// ============= 选择器 =============

export const useDocument = () => useEditorStore((state) => state.current);
export const useViewport = () => useEditorStore((state) => state.viewport);
export const useSelection = () => useEditorStore((state) => state.selection);
export const useCursor = () => useEditorStore((state) => state.cursor);
export const usePluginRegistry = () => useEditorStore((state) => state.registry);
