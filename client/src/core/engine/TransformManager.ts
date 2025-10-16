/**
 * 变换管理器 - 节点变换操作
 */

import { useEditorStore } from '@/store/editorStore';
import type { Point, Size } from '@/types';
import { emit } from '@/utils/eventBus';

export class TransformManager {
  /**
   * 平移节点
   */
  translate(nodeIds: string[], delta: Point): void {
    const updateNode = useEditorStore.getState().updateNode;

    for (const id of nodeIds) {
      const document = useEditorStore.getState().current;
      if (!document) {
        continue;
      }

      const node = this.findNode(document.nodes, id);
      if (node) {
        updateNode(id, {
          position: {
            x: node.position.x + delta.x,
            y: node.position.y + delta.y,
          },
        });
        emit('node:updated', { node, changes: { position: node.position } });
      }
    }
  }

  /**
   * 旋转节点
   */
  rotate(nodeIds: string[], angle: number): void {
    const updateNode = useEditorStore.getState().updateNode;

    for (const id of nodeIds) {
      const document = useEditorStore.getState().current;
      if (!document) {
        continue;
      }

      const node = this.findNode(document.nodes, id);
      if (node) {
        updateNode(id, {
          rotation: (node.rotation + angle) % 360,
        });
        emit('node:updated', { node, changes: { rotation: node.rotation } });
      }
    }
  }

  /**
   * 缩放节点
   */
  scale(nodeIds: string[], factor: number, origin?: Point): void {
    const updateNode = useEditorStore.getState().updateNode;

    for (const id of nodeIds) {
      const document = useEditorStore.getState().current;
      if (!document) {
        continue;
      }

      const node = this.findNode(document.nodes, id);
      if (!node) {
        continue;
      }

      const newSize = {
        width: node.size.width * factor,
        height: node.size.height * factor,
      };

      let newPosition = node.position;

      if (origin) {
        // 围绕原点缩放
        newPosition = {
          x: origin.x + (node.position.x - origin.x) * factor,
          y: origin.y + (node.position.y - origin.y) * factor,
        };
      }

      updateNode(id, {
        size: newSize,
        position: newPosition,
      });

      emit('node:updated', { node, changes: { size: newSize, position: newPosition } });
    }
  }

  /**
   * 调整节点大小
   */
  resize(nodeId: string, newSize: Size): void {
    const updateNode = useEditorStore.getState().updateNode;
    const document = useEditorStore.getState().current;

    if (!document) {
      return;
    }

    const node = this.findNode(document.nodes, nodeId);
    if (!node) {
      return;
    }

    updateNode(nodeId, { size: newSize });
    emit('node:updated', { node, changes: { size: newSize } });
  }

  /**
   * 左对齐
   */
  alignLeft(nodeIds: string[]): void {
    if (nodeIds.length < 2) {
      return;
    }

    const nodes = this.getNodesByIds(nodeIds);
    const minX = Math.min(...nodes.map((n) => n.position.x));

    for (const node of nodes) {
      if (node.position.x !== minX) {
        this.translate([node.id], { x: minX - node.position.x, y: 0 });
      }
    }
  }

  /**
   * 右对齐
   */
  alignRight(nodeIds: string[]): void {
    if (nodeIds.length < 2) {
      return;
    }

    const nodes = this.getNodesByIds(nodeIds);
    const maxX = Math.max(...nodes.map((n) => n.position.x + n.size.width));

    for (const node of nodes) {
      const nodeRight = node.position.x + node.size.width;
      if (nodeRight !== maxX) {
        this.translate([node.id], { x: maxX - nodeRight, y: 0 });
      }
    }
  }

  /**
   * 顶部对齐
   */
  alignTop(nodeIds: string[]): void {
    if (nodeIds.length < 2) {
      return;
    }

    const nodes = this.getNodesByIds(nodeIds);
    const minY = Math.min(...nodes.map((n) => n.position.y));

    for (const node of nodes) {
      if (node.position.y !== minY) {
        this.translate([node.id], { x: 0, y: minY - node.position.y });
      }
    }
  }

  /**
   * 底部对齐
   */
  alignBottom(nodeIds: string[]): void {
    if (nodeIds.length < 2) {
      return;
    }

    const nodes = this.getNodesByIds(nodeIds);
    const maxY = Math.max(...nodes.map((n) => n.position.y + n.size.height));

    for (const node of nodes) {
      const nodeBottom = node.position.y + node.size.height;
      if (nodeBottom !== maxY) {
        this.translate([node.id], { x: 0, y: maxY - nodeBottom });
      }
    }
  }

  /**
   * 水平居中对齐
   */
  alignCenterHorizontal(nodeIds: string[]): void {
    if (nodeIds.length < 2) {
      return;
    }

    const nodes = this.getNodesByIds(nodeIds);
    const minX = Math.min(...nodes.map((n) => n.position.x));
    const maxX = Math.max(...nodes.map((n) => n.position.x + n.size.width));
    const centerX = (minX + maxX) / 2;

    for (const node of nodes) {
      const nodeCenterX = node.position.x + node.size.width / 2;
      if (nodeCenterX !== centerX) {
        this.translate([node.id], { x: centerX - nodeCenterX, y: 0 });
      }
    }
  }

  /**
   * 垂直居中对齐
   */
  alignCenterVertical(nodeIds: string[]): void {
    if (nodeIds.length < 2) {
      return;
    }

    const nodes = this.getNodesByIds(nodeIds);
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxY = Math.max(...nodes.map((n) => n.position.y + n.size.height));
    const centerY = (minY + maxY) / 2;

    for (const node of nodes) {
      const nodeCenterY = node.position.y + node.size.height / 2;
      if (nodeCenterY !== centerY) {
        this.translate([node.id], { x: 0, y: centerY - nodeCenterY });
      }
    }
  }

  // ========== 私有方法 ==========

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

  private getNodesByIds(nodeIds: string[]): import('@/types').CanvasNode[] {
    const document = useEditorStore.getState().current;
    if (!document) {
      return [];
    }

    return nodeIds
      .map((id) => this.findNode(document.nodes, id))
      .filter((node): node is import('@/types').CanvasNode => node !== null);
  }
}

// 导出单例
export const transformManager = new TransformManager();
