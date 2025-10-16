/**
 * 命令队列 - 撤销/重做支持
 */

import type { Command } from '@/types';
import { emit } from '@/utils/eventBus';

export class CommandQueue {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistory = 50; // 最大历史记录数

  /**
   * 执行命令
   */
  execute(command: Command): void {
    command.execute();

    // 添加到撤销栈
    this.undoStack.push(command);

    // 限制历史记录数量
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    // 清空重做栈
    this.redoStack = [];

    // 发送事件
    emit('history:changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  /**
   * 撤销
   */
  undo(): void {
    const command = this.undoStack.pop();
    if (!command) {
      return;
    }

    command.undo();
    this.redoStack.push(command);

    emit('history:changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  /**
   * 重做
   */
  redo(): void {
    const command = this.redoStack.pop();
    if (!command) {
      return;
    }

    command.redo();
    this.undoStack.push(command);

    emit('history:changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];

    emit('history:changed', {
      canUndo: false,
      canRedo: false,
    });
  }

  /**
   * 获取历史记录信息
   */
  getHistoryInfo(): { undoCount: number; redoCount: number } {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    };
  }
}

// 导出单例
export const commandQueue = new CommandQueue();
