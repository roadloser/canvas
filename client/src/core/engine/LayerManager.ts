/**
 * 图层管理器 - z-index 管理
 */

import { useEditorStore } from '@/store/editorStore';
import type { CanvasNode } from '@/types';

export class LayerManager {
  /**
   * 置于顶层
   */
  bringToFront(nodeIds: string[]): void {
    const document = useEditorStore.getState().current;
    if (!document) {
      return;
    }

    const maxZ = Math.max(...document.nodes.map((n) => n.zIndex), 0);

    for (const [index, id] of nodeIds.entries()) {
      useEditorStore.getState().updateNode(id, {
        zIndex: maxZ + index + 1,
      });
    }
  }

  /**
   * 置于底层
   */
  sendToBack(nodeIds: string[]): void {
    const document = useEditorStore.getState().current;
    if (!document) {
      return;
    }

    const minZ = Math.min(...document.nodes.map((n) => n.zIndex), 0);

    for (const [index, id] of nodeIds.entries()) {
      useEditorStore.getState().updateNode(id, {
        zIndex: minZ - nodeIds.length + index,
      });
    }
  }

  /**
   * 上移一层
   */
  bringForward(nodeIds: string[]): void {
    for (const id of nodeIds) {
      const node = this.getNodeById(id);
      if (node) {
        useEditorStore.getState().updateNode(id, {
          zIndex: node.zIndex + 1,
        });
      }
    }
  }

  /**
   * 下移一层
   */
  sendBackward(nodeIds: string[]): void {
    for (const id of nodeIds) {
      const node = this.getNodeById(id);
      if (node) {
        useEditorStore.getState().updateNode(id, {
          zIndex: node.zIndex - 1,
        });
      }
    }
  }

  /**
   * 锁定节点
   */
  lock(nodeIds: string[]): void {
    for (const id of nodeIds) {
      useEditorStore.getState().updateNode(id, { locked: true });
    }
  }

  /**
   * 解锁节点
   */
  unlock(nodeIds: string[]): void {
    for (const id of nodeIds) {
      useEditorStore.getState().updateNode(id, { locked: false });
    }
  }

  /**
   * 显示节点
   */
  show(nodeIds: string[]): void {
    for (const id of nodeIds) {
      useEditorStore.getState().updateNode(id, { visible: true });
    }
  }

  /**
   * 隐藏节点
   */
  hide(nodeIds: string[]): void {
    for (const id of nodeIds) {
      useEditorStore.getState().updateNode(id, { visible: false });
    }
  }

  /**
   * 根据 ID 获取节点
   */
  getNodeById(id: string): CanvasNode | null {
    const document = useEditorStore.getState().current;
    if (!document) {
      return null;
    }

    return this.findNode(document.nodes, id);
  }

  /**
   * 根据类型获取节点
   */
  getNodesByType(type: string): CanvasNode[] {
    const document = useEditorStore.getState().current;
    if (!document) {
      return [];
    }

    const result: CanvasNode[] = [];

    const collect = (nodes: CanvasNode[]) => {
      for (const node of nodes) {
        if (node.type === type) {
          result.push(node);
        }
        if (node.children) {
          collect(node.children);
        }
      }
    };

    collect(document.nodes);
    return result;
  }

  // ========== 私有方法 ==========

  private findNode(nodes: CanvasNode[], id: string): CanvasNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = this.findNode(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}

// 导出单例
export const layerManager = new LayerManager();
