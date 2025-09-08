'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface DragItem {
  id: string;
  type: string;
  data?: Record<string, unknown>;
}

export interface DropResult {
  item: DragItem;
  dropTargetId: string;
  position?: number;
}

export interface UseDragDropOptions {
  onDrop?: (result: DropResult) => void;
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: (item: DragItem) => void;
  acceptedTypes?: string[];
}

export const useDragDrop = (options: UseDragDropOptions = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropTargets, setDropTargets] = useState<Set<string>>(new Set());
  const dragImageRef = useRef<HTMLElement | null>(null);

  const registerDropTarget = useCallback((targetId: string) => {
    setDropTargets(prev => new Set(prev).add(targetId));
    
    return () => {
      setDropTargets(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetId);
        return newSet;
      });
    };
  }, []);

  // Drag source handlers
  const createDragHandlers = useCallback((item: DragItem) => {
    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', JSON.stringify(item));
      
      // Set custom drag image if available
      if (dragImageRef.current) {
        e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
      }
      
      setIsDragging(true);
      setDraggedItem(item);
      options.onDragStart?.(item);
    };

    const handleDragEnd = (e: React.DragEvent) => {
      setIsDragging(false);
      setDraggedItem(null);
      options.onDragEnd?.(item);
    };

    return {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      'aria-grabbed': isDragging && draggedItem?.id === item.id,
      role: 'button',
      tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          // Start keyboard-based drag operation
          handleKeyboardDrag(item);
        }
      },
    };
  }, [isDragging, draggedItem, options]);

  // Drop zone handlers
  const createDropHandlers = useCallback((targetId: string, acceptedTypes?: string[]) => {
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      
      try {
        const data = e.dataTransfer.getData('text/plain');
        const item = JSON.parse(data) as DragItem;
        
        // Check if type is accepted
        const typesFilter = acceptedTypes || options.acceptedTypes;
        if (typesFilter && !typesFilter.includes(item.type)) {
          return;
        }

        // Calculate drop position if needed
        const rect = e.currentTarget.getBoundingClientRect();
        const position = Math.round((e.clientY - rect.top) / 60); // Assuming 60px item height

        const result: DropResult = {
          item,
          dropTargetId: targetId,
          position,
        };

        options.onDrop?.(result);
      } catch (error) {
        console.error('Failed to parse drop data:', error);
      }
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
    };

    return {
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      'aria-dropeffect': 'copy',
      role: 'application',
    };
  }, [options]);

  // Keyboard-based drag and drop
  const [keyboardDragItem, setKeyboardDragItem] = useState<DragItem | null>(null);
  const [keyboardDropMode, setKeyboardDropMode] = useState(false);

  const handleKeyboardDrag = useCallback((item: DragItem) => {
    setKeyboardDragItem(item);
    setKeyboardDropMode(true);
    options.onDragStart?.(item);
  }, [options]);

  const handleKeyboardDrop = useCallback((targetId: string, position?: number) => {
    if (keyboardDragItem) {
      const result: DropResult = {
        item: keyboardDragItem,
        dropTargetId: targetId,
        position,
      };
      
      options.onDrop?.(result);
      setKeyboardDragItem(null);
      setKeyboardDropMode(false);
      options.onDragEnd?.(keyboardDragItem);
    }
  }, [keyboardDragItem, options]);

  const cancelKeyboardDrag = useCallback(() => {
    if (keyboardDragItem) {
      setKeyboardDragItem(null);
      setKeyboardDropMode(false);
      options.onDragEnd?.(keyboardDragItem);
    }
  }, [keyboardDragItem, options]);

  // Keyboard navigation for drop targets
  useEffect(() => {
    if (!keyboardDropMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelKeyboardDrag();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboardDropMode, cancelKeyboardDrag]);

  const createKeyboardDropHandlers = useCallback((targetId: string) => {
    if (!keyboardDropMode) return {};

    return {
      tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleKeyboardDrop(targetId);
        }
      },
      'aria-label': `Drop zone for ${targetId}. Press Enter to drop here.`,
    };
  }, [keyboardDropMode, handleKeyboardDrop]);

  return {
    // State
    isDragging,
    draggedItem,
    keyboardDropMode,
    keyboardDragItem,

    // Handlers
    createDragHandlers,
    createDropHandlers,
    createKeyboardDropHandlers,
    registerDropTarget,
    
    // Keyboard operations
    handleKeyboardDrop,
    cancelKeyboardDrag,
    
    // Refs
    dragImageRef,
  };
};