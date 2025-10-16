/**
 * 平移命令
 */

import { useEditorStore } from '@/store/editorStore';
import type { Command, Point } from '@/types';

export class TranslateCommand implements Command {
  private prevPositions: Map<string, Point> = new Map();
  private nodeIds: string[];
  private delta: Point;

  constructor(nodeIds: string[], delta: Point) {
    this.nodeIds = nodeIds;
    this.delta = delta;
  }

  execute(): void {
    const document = useEditorStore.getState().current;
    if (!document) {
      return;
    }

    // 保存原始位置
    for (const id of this.nodeIds) {
      const node = this.findNode(document.nodes, id);
      if (node) {
        this.prevPositions.set(id, { ...node.position });

        useEditorStore.getState().updateNode(id, {
          position: {
            x: node.position.x + this.delta.x,
            y: node.position.y + this.delta.y,
          },
        });
      }
    }
  }

  undo(): void {
    for (const id of this.nodeIds) {
      const prevPos = this.prevPositions.get(id);
      if (prevPos) {
        useEditorStore.getState().updateNode(id, {
          position: prevPos,
        });
      }
    }
  }

  redo(): void {
    this.execute();
  }

  /**
   * 合并连续的平移命令
   */
  merge(command: Command): boolean {
    if (!(command instanceof TranslateCommand)) {
      return false;
    }

    // 判断是否是相同节点的连续操作
    if (
      this.nodeIds.length === command.nodeIds.length &&
      this.nodeIds.every((id, index) => id === command.nodeIds[index])
    ) {
      this.delta.x += command.delta.x;
      this.delta.y += command.delta.y;
      return true;
    }

    return false;
  }

  private findNode(
    nodes: import('@/types').CanvasNode[],
    id: string
  ): import('@/types').CanvasNode | null {
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
