'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UseUndoRedoOptions {
  maxHistorySize?: number;
  ignoreIdenticalStates?: boolean;
}

export const useUndoRedo = <T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
) => {
  const { maxHistorySize = 50, ignoreIdenticalStates = true } = options;

  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const isUndoing = useRef(false);
  const isRedoing = useRef(false);

  // Helper function to compare states
  const areStatesEqual = useCallback((a: T, b: T): boolean => {
    if (ignoreIdenticalStates) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }, [ignoreIdenticalStates]);

  // Set new state with history management
  const set = useCallback((newState: T | ((prevState: T) => T)) => {
    setState(currentState => {
      const nextPresent = typeof newState === 'function' 
        ? (newState as (prevState: T) => T)(currentState.present)
        : newState;

      // Don't add to history if state hasn't changed
      if (ignoreIdenticalStates && areStatesEqual(currentState.present, nextPresent)) {
        return currentState;
      }

      // Don't add to history during undo/redo operations
      if (isUndoing.current || isRedoing.current) {
        isUndoing.current = false;
        isRedoing.current = false;
        return {
          ...currentState,
          present: nextPresent,
        };
      }

      const newPast = [...currentState.past, currentState.present];
      
      // Limit history size
      if (newPast.length > maxHistorySize) {
        newPast.splice(0, newPast.length - maxHistorySize);
      }

      return {
        past: newPast,
        present: nextPresent,
        future: [], // Clear future when new state is set
      };
    });
  }, [areStatesEqual, ignoreIdenticalStates, maxHistorySize]);

  // Undo operation
  const undo = useCallback(() => {
    setState(currentState => {
      if (currentState.past.length === 0) {
        return currentState;
      }

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      isUndoing.current = true;

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  // Redo operation
  const redo = useCallback(() => {
    setState(currentState => {
      if (currentState.future.length === 0) {
        return currentState;
      }

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      isRedoing.current = true;

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Reset to initial state and clear history
  const reset = useCallback(() => {
    setState({
      past: [],
      present: initialState,
      future: [],
    });
  }, [initialState]);

  // Clear all history but keep current state
  const clearHistory = useCallback(() => {
    setState(currentState => ({
      past: [],
      present: currentState.present,
      future: [],
    }));
  }, []);

  // Jump to specific state in history
  const jumpTo = useCallback((index: number) => {
    setState(currentState => {
      const totalStates = currentState.past.length + 1 + currentState.future.length;
      
      if (index < 0 || index >= totalStates) {
        return currentState;
      }

      const allStates = [
        ...currentState.past,
        currentState.present,
        ...currentState.future,
      ];

      const targetState = allStates[index];
      const newPast = allStates.slice(0, index);
      const newFuture = allStates.slice(index + 1);

      return {
        past: newPast,
        present: targetState,
        future: newFuture,
      };
    });
  }, []);

  // Get history information
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;
  const historyLength = state.past.length + 1 + state.future.length;
  const currentIndex = state.past.length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
          event.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  return {
    // Current state
    state: state.present,
    
    // History state
    past: state.past,
    future: state.future,
    
    // Actions
    set,
    undo,
    redo,
    reset,
    clearHistory,
    jumpTo,
    
    // Status
    canUndo,
    canRedo,
    historyLength,
    currentIndex,
  };
};