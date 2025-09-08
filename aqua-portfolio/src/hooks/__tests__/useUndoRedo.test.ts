import { renderHook, act } from '@testing-library/react'
import { useUndoRedo } from '../useUndoRedo'

describe('useUndoRedo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with the initial state', () => {
    const initialState = { count: 0, items: [] }
    const { result } = renderHook(() => useUndoRedo(initialState))

    expect(result.current.state).toEqual(initialState)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.history.length).toBe(1)
    expect(result.current.currentIndex).toBe(0)
  })

  it('should execute actions and add to history', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useUndoRedo(initialState))

    act(() => {
      result.current.execute((state) => ({ ...state, count: state.count + 1 }))
    })

    expect(result.current.state.count).toBe(1)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.history.length).toBe(2)
    expect(result.current.currentIndex).toBe(1)
  })

  it('should undo actions correctly', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useUndoRedo(initialState))

    // Execute some actions
    act(() => {
      result.current.execute((state) => ({ ...state, count: 1 }))
    })

    act(() => {
      result.current.execute((state) => ({ ...state, count: 2 }))
    })

    expect(result.current.state.count).toBe(2)
    expect(result.current.canUndo).toBe(true)

    // Undo once
    act(() => {
      result.current.undo()
    })

    expect(result.current.state.count).toBe(1)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)

    // Undo again
    act(() => {
      result.current.undo()
    })

    expect(result.current.state.count).toBe(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('should redo actions correctly', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useUndoRedo(initialState))

    // Execute and then undo
    act(() => {
      result.current.execute((state) => ({ ...state, count: 1 }))
    })

    act(() => {
      result.current.undo()
    })

    expect(result.current.state.count).toBe(0)
    expect(result.current.canRedo).toBe(true)

    // Redo
    act(() => {
      result.current.redo()
    })

    expect(result.current.state.count).toBe(1)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should clear redo history when executing new action after undo', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useUndoRedo(initialState))

    // Execute, undo, then execute new action
    act(() => {
      result.current.execute((state) => ({ ...state, count: 1 }))
    })

    act(() => {
      result.current.execute((state) => ({ ...state, count: 2 }))
    })

    act(() => {
      result.current.undo()
    })

    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.execute((state) => ({ ...state, count: 3 }))
    })

    expect(result.current.state.count).toBe(3)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.history.length).toBe(3) // Initial + 1 + 3
  })

  it('should respect history limit', () => {
    const initialState = { count: 0 }
    const historyLimit = 3
    const { result } = renderHook(() => 
      useUndoRedo(initialState, { historyLimit })
    )

    // Execute more actions than the limit
    for (let i = 1; i <= 5; i++) {
      act(() => {
        result.current.execute((state) => ({ ...state, count: i }))
      })
    }

    expect(result.current.history.length).toBe(historyLimit)
    expect(result.current.state.count).toBe(5)

    // Should only be able to undo up to the limit
    let undoCount = 0
    while (result.current.canUndo && undoCount < 5) {
      act(() => {
        result.current.undo()
      })
      undoCount++
    }

    expect(undoCount).toBe(historyLimit - 1)
  })

  it('should handle keyboard shortcuts', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useUndoRedo(initialState))

    // Execute an action
    act(() => {
      result.current.execute((state) => ({ ...state, count: 1 }))
    })

    // Mock keyboard event for Ctrl+Z (undo)
    const undoEvent = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    })

    act(() => {
      result.current.handleKeydown(undoEvent)
    })

    expect(result.current.state.count).toBe(0)

    // Mock keyboard event for Ctrl+Y (redo)
    const redoEvent = new KeyboardEvent('keydown', {
      key: 'y',
      ctrlKey: true,
    })

    act(() => {
      result.current.handleKeydown(redoEvent)
    })

    expect(result.current.state.count).toBe(1)
  })

  it('should handle Mac keyboard shortcuts', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useUndoRedo(initialState))

    // Execute an action
    act(() => {
      result.current.execute((state) => ({ ...state, count: 1 }))
    })

    // Mock Mac keyboard event for Cmd+Z
    const undoEvent = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
    })

    act(() => {
      result.current.handleKeydown(undoEvent)
    })

    expect(result.current.state.count).toBe(0)

    // Mock Mac keyboard event for Cmd+Shift+Z
    const redoEvent = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
      shiftKey: true,
    })

    act(() => {
      result.current.handleKeydown(redoEvent)
    })

    expect(result.current.state.count).toBe(1)
  })

  it('should call onUndo and onRedo callbacks', () => {
    const onUndo = jest.fn()
    const onRedo = jest.fn()
    const initialState = { count: 0 }
    
    const { result } = renderHook(() => 
      useUndoRedo(initialState, { onUndo, onRedo })
    )

    // Execute and undo
    act(() => {
      result.current.execute((state) => ({ ...state, count: 1 }))
    })

    act(() => {
      result.current.undo()
    })

    expect(onUndo).toHaveBeenCalledWith({ count: 0 }, { count: 1 })

    act(() => {
      result.current.redo()
    })

    expect(onRedo).toHaveBeenCalledWith({ count: 1 }, { count: 0 })
  })

  it('should clear history', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useUndoRedo(initialState))

    // Execute some actions
    act(() => {
      result.current.execute((state) => ({ ...state, count: 1 }))
    })

    act(() => {
      result.current.execute((state) => ({ ...state, count: 2 }))
    })

    expect(result.current.history.length).toBe(3)

    act(() => {
      result.current.clearHistory()
    })

    expect(result.current.history.length).toBe(1)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.currentIndex).toBe(0)
  })

  it('should reset to initial state', () => {
    const initialState = { count: 0, name: 'test' }
    const { result } = renderHook(() => useUndoRedo(initialState))

    // Execute some actions
    act(() => {
      result.current.execute((state) => ({ ...state, count: 1 }))
    })

    act(() => {
      result.current.execute((state) => ({ ...state, name: 'changed' }))
    })

    expect(result.current.state).toEqual({ count: 1, name: 'changed' })

    act(() => {
      result.current.reset()
    })

    expect(result.current.state).toEqual(initialState)
    expect(result.current.history.length).toBe(1)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('should handle complex state mutations', () => {
    const initialState = { 
      items: [{ id: 1, text: 'item 1' }],
      count: 0 
    }
    
    const { result } = renderHook(() => useUndoRedo(initialState))

    // Add item
    act(() => {
      result.current.execute((state) => ({
        ...state,
        items: [...state.items, { id: 2, text: 'item 2' }],
        count: state.count + 1
      }))
    })

    expect(result.current.state.items).toHaveLength(2)
    expect(result.current.state.count).toBe(1)

    // Remove item
    act(() => {
      result.current.execute((state) => ({
        ...state,
        items: state.items.filter(item => item.id !== 1),
        count: state.count - 1
      }))
    })

    expect(result.current.state.items).toHaveLength(1)
    expect(result.current.state.items[0].id).toBe(2)

    // Undo
    act(() => {
      result.current.undo()
    })

    expect(result.current.state.items).toHaveLength(2)
    expect(result.current.state.count).toBe(1)
  })

  it('should prevent undo/redo when not available', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useUndoRedo(initialState))

    // Try to undo when no history
    act(() => {
      result.current.undo()
    })

    expect(result.current.state.count).toBe(0)

    // Try to redo when no future history
    act(() => {
      result.current.redo()
    })

    expect(result.current.state.count).toBe(0)
  })

  it('should handle edge case of single history item', () => {
    const initialState = { value: 'test' }
    const { result } = renderHook(() => useUndoRedo(initialState, { historyLimit: 1 }))

    expect(result.current.history.length).toBe(1)
    expect(result.current.canUndo).toBe(false)

    // Execute action - should replace the single history item
    act(() => {
      result.current.execute((state) => ({ ...state, value: 'changed' }))
    })

    expect(result.current.history.length).toBe(1)
    expect(result.current.state.value).toBe('changed')
    expect(result.current.canUndo).toBe(false)
  })

  it('should ignore non-undo/redo keyboard events', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useUndoRedo(initialState))

    const irrelevantEvent = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
    })

    act(() => {
      result.current.handleKeydown(irrelevantEvent)
    })

    // State should remain unchanged
    expect(result.current.state.count).toBe(0)
  })
})