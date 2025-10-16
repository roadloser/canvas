/**
 * 键盘快捷键 Hook
 */

import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';

export function useKeyboard(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selection = useEditorStore.getState().selection;
      const deleteNode = useEditorStore.getState().deleteNode;
      const deselectAll = useEditorStore.getState().deselectAll;

      // Delete/Backspace - 删除选中节点
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.nodeIds.length > 0) {
        e.preventDefault();
        for (const id of selection.nodeIds) {
          deleteNode(id);
        }
        deselectAll();
      }

      // Escape - 取消选择
      if (e.key === 'Escape') {
        deselectAll();
      }

      // Cmd/Ctrl + A - 全选
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const document = useEditorStore.getState().current;
        if (document) {
          const allIds = document.nodes.map((n) => n.id);
          useEditorStore.getState().selectNodes(allIds);
        }
      }

      // Cmd/Ctrl + D - 复制选中节点
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        const duplicateNode = useEditorStore.getState().duplicateNode;
        for (const id of selection.nodeIds) {
          duplicateNode(id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
