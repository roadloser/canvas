/**
 * 选择管理器
 */

import { useEditorStore } from '@/store/editorStore';
import type { Bounds, CanvasNode, Point } from '@/types';
import { emit } from '@/utils/eventBus';
import { intersects } from '@/utils/geometry';

export class SelectionManager {
  /**
   * 选择节点
   */
  select(nodeIds: string | string[]): void {
    const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
    useEditorStore.getState().selectNodes(ids);
    emit('selection:changed', { nodeIds: ids });
  }

  /**
   * 取消选择
   */
  deselect(nodeIds?: string[]): void {
    if (nodeIds) {
      const currentSelection = useEditorStore.getState().selection.nodeIds;
      const newSelection = currentSelection.filter((id) => !nodeIds.includes(id));
      useEditorStore.getState().selectNodes(newSelection);
      emit('selection:changed', { nodeIds: newSelection });
    } else {
      useEditorStore.getState().deselectAll();
      emit('selection:changed', { nodeIds: [] });
    }
  }

  /**
   * 选择所有节点
   */
  selectAll(): void {
    const document = useEditorStore.getState().current;
    if (!document) {
      return;
    }

    const allIds = this.getAllNodeIds(document.nodes);
    this.select(allIds);
  }

  /**
   * 清空选择
   */
  selectNone(): void {
    this.deselect();
  }

  /**
   * 切换选择状态
   */
  toggleSelection(nodeId: string): void {
    const currentSelection = useEditorStore.getState().selection.nodeIds;
    if (currentSelection.includes(nodeId)) {
      this.deselect([nodeId]);
    } else {
      this.select([...currentSelection, nodeId]);
    }
  }

  /**
   * 框选节点
   */
  selectInBox(boxBounds: Bounds): void {
    const document = useEditorStore.getState().current;
    if (!document) {
      return;
    }

    const selectedIds: string[] = [];

    const checkNode = (node: CanvasNode) => {
      const nodeBounds = {
        x: node.position.x,
        y: node.position.y,
        width: node.size.width,
        height: node.size.height,
      };

      if (intersects(nodeBounds, boxBounds)) {
        selectedIds.push(node.id);
      }

      if (node.children) {
        for (const child of node.children) {
          checkNode(child);
        }
      }
    };

    for (const node of document.nodes) {
      checkNode(node);
    }

    this.select(selectedIds);
  }

  /**
   * 获取选中的节点
   */
  getSelection(): CanvasNode[] {
    const document = useEditorStore.getState().current;
    const selection = useEditorStore.getState().selection;

    if (!document) {
      return [];
    }

    const result: CanvasNode[] = [];

    const findNode = (nodes: CanvasNode[], id: string): CanvasNode | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return node;
        }
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    for (const id of selection.nodeIds) {
      const node = findNode(document.nodes, id);
      if (node) {
        result.push(node);
      }
    }

    return result;
  }

  /**
   * 判断节点是否被选中
   */
  isSelected(nodeId: string): boolean {
    return useEditorStore.getState().selection.nodeIds.includes(nodeId);
  }

  /**
   * 获取选择边界框
   */
  getSelectionBounds(): Bounds | null {
    const selected = this.getSelection();
    if (selected.length === 0) {
      return null;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const node of selected) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.size.width);
      maxY = Math.max(maxY, node.position.y + node.size.height);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * 根据点击位置选择节点
   */
  selectAtPoint(point: Point): CanvasNode | null {
    const document = useEditorStore.getState().current;
    if (!document) {
      return null;
    }

    // 从上到下查找 (zIndex 高的优先)
    const sortedNodes = [...document.nodes].sort((a, b) => b.zIndex - a.zIndex);

    for (const node of sortedNodes) {
      if (this.isPointInNode(point, node)) {
        this.select(node.id);
        return node;
      }
    }

    // 没有点击到节点,清空选择
    this.selectNone();
    return null;
  }

  // ========== 私有方法 ==========

  private getAllNodeIds(nodes: CanvasNode[]): string[] {
    const ids: string[] = [];

    for (const node of nodes) {
      ids.push(node.id);
      if (node.children) {
        ids.push(...this.getAllNodeIds(node.children));
      }
    }

    return ids;
  }

  private isPointInNode(point: Point, node: CanvasNode): boolean {
    return (
      point.x >= node.position.x &&
      point.x <= node.position.x + node.size.width &&
      point.y >= node.position.y &&
      point.y <= node.position.y + node.size.height
    );
  }
}

// 导出单例
export const selectionManager = new SelectionManager();
