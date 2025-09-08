import { renderHook, act, fireEvent } from '@testing-library/react'
import { useDragDrop } from '../useDragDrop'

// Mock touch events
global.TouchEvent = class TouchEvent extends Event {
  touches: Touch[]
  targetTouches: Touch[]
  changedTouches: Touch[]

  constructor(type: string, init?: TouchEventInit) {
    super(type, init)
    this.touches = init?.touches || []
    this.targetTouches = init?.targetTouches || []
    this.changedTouches = init?.changedTouches || []
  }
} as any

describe('useDragDrop', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDragDrop())

    expect(result.current.isDragging).toBe(false)
    expect(result.current.draggedItem).toBe(null)
    expect(result.current.dropTarget).toBe(null)
    expect(result.current.keyboardDropMode).toBe(false)
    expect(typeof result.current.createDragHandlers).toBe('function')
    expect(typeof result.current.createDropHandlers).toBe('function')
    expect(typeof result.current.createKeyboardDropHandlers).toBe('function')
    expect(typeof result.current.resetDragState).toBe('function')
  })

  it('should create drag handlers with proper event listeners', () => {
    const onDragStart = jest.fn()
    const { result } = renderHook(() => useDragDrop({ onDragStart }))

    const item = { id: '1', content: 'Test Item' }
    const handlers = result.current.createDragHandlers(item)

    expect(handlers.draggable).toBe(true)
    expect(typeof handlers.onDragStart).toBe('function')
    expect(typeof handlers.onDragEnd).toBe('function')
    expect(typeof handlers.onMouseDown).toBe('function')
    expect(typeof handlers.onTouchStart).toBe('function')
    expect(typeof handlers.onKeyDown).toBe('function')
  })

  it('should handle drag start events', () => {
    const onDragStart = jest.fn()
    const { result } = renderHook(() => useDragDrop({ onDragStart }))

    const item = { id: '1', content: 'Test Item' }
    const handlers = result.current.createDragHandlers(item)

    const mockEvent = {
      dataTransfer: {
        setData: jest.fn(),
        effectAllowed: '',
      },
      preventDefault: jest.fn(),
    } as any

    act(() => {
      handlers.onDragStart(mockEvent)
    })

    expect(result.current.isDragging).toBe(true)
    expect(result.current.draggedItem).toBe(item)
    expect(onDragStart).toHaveBeenCalledWith(item, mockEvent)
    expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', JSON.stringify(item))
  })

  it('should handle drag end events', () => {
    const onDragEnd = jest.fn()
    const { result } = renderHook(() => useDragDrop({ onDragEnd }))

    const item = { id: '1', content: 'Test Item' }
    const handlers = result.current.createDragHandlers(item)

    const mockStartEvent = {
      dataTransfer: { setData: jest.fn(), effectAllowed: '' },
      preventDefault: jest.fn(),
    } as any

    const mockEndEvent = {} as any

    act(() => {
      handlers.onDragStart(mockStartEvent)
    })

    expect(result.current.isDragging).toBe(true)

    act(() => {
      handlers.onDragEnd(mockEndEvent)
    })

    expect(result.current.isDragging).toBe(false)
    expect(result.current.draggedItem).toBe(null)
    expect(onDragEnd).toHaveBeenCalledWith(item, mockEndEvent)
  })

  it('should create drop handlers', () => {
    const onDrop = jest.fn()
    const { result } = renderHook(() => useDragDrop({ onDrop }))

    const zone = { id: 'zone1', accept: ['text'] }
    const handlers = result.current.createDropHandlers(zone)

    expect(typeof handlers.onDragOver).toBe('function')
    expect(typeof handlers.onDragEnter).toBe('function')
    expect(typeof handlers.onDragLeave).toBe('function')
    expect(typeof handlers.onDrop).toBe('function')
  })

  it('should handle drop events', () => {
    const onDrop = jest.fn()
    const { result } = renderHook(() => useDragDrop({ onDrop }))

    const item = { id: '1', content: 'Test Item' }
    const zone = { id: 'zone1', accept: ['text'] }

    // Start drag
    const dragHandlers = result.current.createDragHandlers(item)
    const mockDragEvent = {
      dataTransfer: { setData: jest.fn(), effectAllowed: '' },
      preventDefault: jest.fn(),
    } as any

    act(() => {
      dragHandlers.onDragStart(mockDragEvent)
    })

    // Handle drop
    const dropHandlers = result.current.createDropHandlers(zone)
    const mockDropEvent = {
      dataTransfer: { getData: jest.fn().mockReturnValue(JSON.stringify(item)) },
      preventDefault: jest.fn(),
    } as any

    act(() => {
      dropHandlers.onDrop(mockDropEvent)
    })

    expect(onDrop).toHaveBeenCalledWith(item, zone, mockDropEvent)
    expect(result.current.isDragging).toBe(false)
    expect(result.current.draggedItem).toBe(null)
  })

  it('should handle keyboard navigation', () => {
    const { result } = renderHook(() => useDragDrop())

    const item = { id: '1', content: 'Test Item' }
    const handlers = result.current.createDragHandlers(item)

    const mockKeyEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
      currentTarget: { focus: jest.fn() }
    } as any

    act(() => {
      handlers.onKeyDown(mockKeyEvent)
    })

    expect(result.current.keyboardDropMode).toBe(true)
    expect(result.current.draggedItem).toBe(item)
  })

  it('should handle keyboard drop mode', () => {
    const onDrop = jest.fn()
    const { result } = renderHook(() => useDragDrop({ onDrop }))

    const item = { id: '1', content: 'Test Item' }
    const zone = { id: 'zone1', accept: ['text'] }

    // Enter keyboard drop mode
    const dragHandlers = result.current.createDragHandlers(item)
    const mockKeyEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
      currentTarget: { focus: jest.fn() }
    } as any

    act(() => {
      dragHandlers.onKeyDown(mockKeyEvent)
    })

    expect(result.current.keyboardDropMode).toBe(true)

    // Handle keyboard drop
    const keyboardHandlers = result.current.createKeyboardDropHandlers(zone)
    const mockDropKeyEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
    } as any

    act(() => {
      keyboardHandlers.onKeyDown(mockDropKeyEvent)
    })

    expect(onDrop).toHaveBeenCalledWith(item, zone, mockDropKeyEvent)
    expect(result.current.keyboardDropMode).toBe(false)
    expect(result.current.draggedItem).toBe(null)
  })

  it('should handle touch events', () => {
    const onDragStart = jest.fn()
    const { result } = renderHook(() => useDragDrop({ onDragStart }))

    const item = { id: '1', content: 'Test Item' }
    const handlers = result.current.createDragHandlers(item)

    const mockTouchEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
      preventDefault: jest.fn(),
    } as any

    act(() => {
      handlers.onTouchStart(mockTouchEvent)
    })

    expect(result.current.isDragging).toBe(true)
    expect(result.current.draggedItem).toBe(item)
  })

  it('should reset drag state', () => {
    const { result } = renderHook(() => useDragDrop())

    const item = { id: '1', content: 'Test Item' }
    const handlers = result.current.createDragHandlers(item)

    const mockEvent = {
      dataTransfer: { setData: jest.fn(), effectAllowed: '' },
      preventDefault: jest.fn(),
    } as any

    act(() => {
      handlers.onDragStart(mockEvent)
    })

    expect(result.current.isDragging).toBe(true)

    act(() => {
      result.current.resetDragState()
    })

    expect(result.current.isDragging).toBe(false)
    expect(result.current.draggedItem).toBe(null)
    expect(result.current.dropTarget).toBe(null)
    expect(result.current.keyboardDropMode).toBe(false)
  })

  it('should handle drag enter and leave for drop zones', () => {
    const { result } = renderHook(() => useDragDrop())

    const zone = { id: 'zone1', accept: ['text'] }
    const handlers = result.current.createDropHandlers(zone)

    const mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: { dropEffect: '' }
    } as any

    act(() => {
      handlers.onDragEnter(mockEvent)
    })

    expect(result.current.dropTarget).toBe(zone)

    act(() => {
      handlers.onDragLeave(mockEvent)
    })

    expect(result.current.dropTarget).toBe(null)
  })

  it('should handle accessibility features', () => {
    const { result } = renderHook(() => useDragDrop())

    const item = { id: '1', content: 'Test Item' }
    const handlers = result.current.createDragHandlers(item)

    expect(handlers['aria-describedby']).toBe('drag-drop-instructions')
    expect(handlers.role).toBe('button')
    expect(handlers.tabIndex).toBe(0)
  })

  it('should handle escape key to cancel keyboard drop mode', () => {
    const { result } = renderHook(() => useDragDrop())

    const item = { id: '1', content: 'Test Item' }
    const handlers = result.current.createDragHandlers(item)

    // Enter keyboard drop mode
    const mockEnterEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
      currentTarget: { focus: jest.fn() }
    } as any

    act(() => {
      handlers.onKeyDown(mockEnterEvent)
    })

    expect(result.current.keyboardDropMode).toBe(true)

    // Press escape to cancel
    const mockEscapeEvent = {
      key: 'Escape',
      preventDefault: jest.fn(),
    } as any

    act(() => {
      handlers.onKeyDown(mockEscapeEvent)
    })

    expect(result.current.keyboardDropMode).toBe(false)
    expect(result.current.draggedItem).toBe(null)
  })

  it('should validate drop acceptance', () => {
    const onDrop = jest.fn()
    const { result } = renderHook(() => useDragDrop({ onDrop }))

    const item = { id: '1', content: 'Test Item', type: 'text' }
    const restrictiveZone = { id: 'zone1', accept: ['image'] }

    // Start drag
    const dragHandlers = result.current.createDragHandlers(item)
    const mockDragEvent = {
      dataTransfer: { setData: jest.fn(), effectAllowed: '' },
      preventDefault: jest.fn(),
    } as any

    act(() => {
      dragHandlers.onDragStart(mockDragEvent)
    })

    // Try to drop in restrictive zone
    const dropHandlers = result.current.createDropHandlers(restrictiveZone)
    const mockDropEvent = {
      dataTransfer: { getData: jest.fn().mockReturnValue(JSON.stringify(item)) },
      preventDefault: jest.fn(),
    } as any

    act(() => {
      dropHandlers.onDrop(mockDropEvent)
    })

    // Should not call onDrop for incompatible types
    expect(onDrop).not.toHaveBeenCalled()
  })

  it('should handle custom drag effects', () => {
    const { result } = renderHook(() => useDragDrop({ 
      dragEffect: 'copy' 
    }))

    const item = { id: '1', content: 'Test Item' }
    const handlers = result.current.createDragHandlers(item)

    const mockEvent = {
      dataTransfer: { setData: jest.fn(), effectAllowed: '' },
      preventDefault: jest.fn(),
    } as any

    act(() => {
      handlers.onDragStart(mockEvent)
    })

    expect(mockEvent.dataTransfer.effectAllowed).toBe('copy')
  })
})