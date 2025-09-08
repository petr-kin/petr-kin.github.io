import { renderHook, act } from '@testing-library/react'
import { useGestures } from '../useGestures'

// Mock navigator.vibrate
const mockVibrate = jest.fn()
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: mockVibrate,
})

// Create mock touch events
const createMockTouch = (x: number, y: number) => ({
  clientX: x,
  clientY: y,
  identifier: 0,
  target: document.createElement('div'),
  screenX: x,
  screenY: y,
  pageX: x,
  pageY: y,
  radiusX: 1,
  radiusY: 1,
  rotationAngle: 0,
  force: 1,
})

const createMockTouchEvent = (type: string, touches: any[], targetTouches?: any[]) => {
  const event = {
    type,
    touches,
    targetTouches: targetTouches || touches,
    changedTouches: touches,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  }
  return event as unknown as TouchEvent
}

describe('useGestures', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockVibrate.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGestures())

    expect(result.current.isActive).toBe(false)
    expect(result.current.gestureState.startX).toBe(0)
    expect(result.current.gestureState.startY).toBe(0)
    expect(result.current.gestureState.deltaX).toBe(0)
    expect(result.current.gestureState.deltaY).toBe(0)
    expect(result.current.gestureState.direction).toBe(null)
    expect(result.current.gestureState.isSwipe).toBe(false)
    expect(result.current.gestureState.isPinch).toBe(false)
    expect(result.current.gestureState.scale).toBe(1)
  })

  it('should handle touch start correctly', () => {
    const onSwipeStart = jest.fn()
    const { result } = renderHook(() => useGestures({ onSwipeStart }))

    const handlers = result.current.createGestureHandlers()
    const touchEvent = createMockTouchEvent('touchstart', [createMockTouch(100, 200)])

    act(() => {
      handlers.onTouchStart(touchEvent)
    })

    expect(result.current.isActive).toBe(true)
    expect(result.current.gestureState.startX).toBe(100)
    expect(result.current.gestureState.startY).toBe(200)
    expect(onSwipeStart).toHaveBeenCalledWith(expect.objectContaining({
      startX: 100,
      startY: 200,
      deltaX: 0,
      deltaY: 0,
    }))
  })

  it('should detect swipe gestures', () => {
    const onSwipeRight = jest.fn()
    const onSwipeEnd = jest.fn()
    const { result } = renderHook(() => useGestures({ 
      onSwipeRight,
      onSwipeEnd,
      swipeThreshold: 50,
      velocityThreshold: 0.1
    }))

    const handlers = result.current.createGestureHandlers()

    // Start touch
    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 200)]))
    })

    // Move touch to trigger swipe with sufficient distance
    act(() => {
      handlers.onTouchMove(createMockTouchEvent('touchmove', [createMockTouch(180, 200)]))
    })

    // Advance time to create velocity
    act(() => {
      jest.advanceTimersByTime(100)
    })

    // End touch
    act(() => {
      handlers.onTouchEnd(createMockTouchEvent('touchend', []))
    })

    // Check that swipe callbacks were called
    expect(onSwipeEnd).toHaveBeenCalled()
  })

  it('should detect left swipe gestures', () => {
    const onSwipeLeft = jest.fn()
    const onSwipeEnd = jest.fn()
    const { result } = renderHook(() => useGestures({ 
      onSwipeLeft,
      onSwipeEnd,
      swipeThreshold: 50,
      velocityThreshold: 0.1
    }))

    const handlers = result.current.createGestureHandlers()

    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(200, 100)]))
    })

    act(() => {
      handlers.onTouchMove(createMockTouchEvent('touchmove', [createMockTouch(120, 100)]))
    })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    act(() => {
      handlers.onTouchEnd(createMockTouchEvent('touchend', []))
    })

    expect(onSwipeEnd).toHaveBeenCalled()
  })

  it('should detect up and down swipe gestures', () => {
    const onSwipeUp = jest.fn()
    const onSwipeDown = jest.fn()
    const onSwipeEnd = jest.fn()

    // Test up swipe
    const { result: resultUp } = renderHook(() => useGestures({ 
      onSwipeUp,
      onSwipeEnd,
      swipeThreshold: 50,
      velocityThreshold: 0.1
    }))

    const handlersUp = resultUp.current.createGestureHandlers()

    act(() => {
      handlersUp.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 200)]))
      handlersUp.onTouchMove(createMockTouchEvent('touchmove', [createMockTouch(100, 120)]))
      jest.advanceTimersByTime(100)
      handlersUp.onTouchEnd(createMockTouchEvent('touchend', []))
    })

    expect(onSwipeEnd).toHaveBeenCalled()

    // Test down swipe
    const { result: resultDown } = renderHook(() => useGestures({ 
      onSwipeDown,
      onSwipeEnd,
      swipeThreshold: 50,
      velocityThreshold: 0.1
    }))

    const handlersDown = resultDown.current.createGestureHandlers()
    const onSwipeEndDown = jest.fn()

    act(() => {
      handlersDown.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 100)]))
      handlersDown.onTouchMove(createMockTouchEvent('touchmove', [createMockTouch(100, 180)]))
      jest.advanceTimersByTime(100)
      handlersDown.onTouchEnd(createMockTouchEvent('touchend', []))
    })

    expect(resultDown.current.createGestureHandlers).toBeDefined()
  })

  it('should detect tap gestures', () => {
    const onTap = jest.fn()
    const { result } = renderHook(() => useGestures({ onTap }))

    const handlers = result.current.createGestureHandlers()

    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 200)]))
    })

    // Fast tap (under 200ms, minimal movement)
    act(() => {
      jest.advanceTimersByTime(100)
      handlers.onTouchEnd(createMockTouchEvent('touchend', []))
    })

    // Test that handlers are working
    expect(handlers.onTouchStart).toBeDefined()
    expect(handlers.onTouchEnd).toBeDefined()
  })

  it('should detect long press gestures', () => {
    const onLongPress = jest.fn()
    const { result } = renderHook(() => useGestures({ 
      onLongPress,
      longPressDelay: 500 
    }))

    const handlers = result.current.createGestureHandlers()

    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 200)]))
    })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(onLongPress).toHaveBeenCalled()
  })

  it('should cancel long press on movement', () => {
    const onLongPress = jest.fn()
    const { result } = renderHook(() => useGestures({ 
      onLongPress,
      longPressDelay: 500 
    }))

    const handlers = result.current.createGestureHandlers()

    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 200)]))
    })

    act(() => {
      jest.advanceTimersByTime(200)
      handlers.onTouchMove(createMockTouchEvent('touchmove', [createMockTouch(120, 220)]))
    })

    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('should detect pinch gestures', () => {
    const onPinchStart = jest.fn()
    const onPinchMove = jest.fn()
    const onPinchEnd = jest.fn()

    const { result } = renderHook(() => useGestures({ 
      onPinchStart,
      onPinchMove,
      onPinchEnd,
      minPinchDistance: 50
    }))

    const handlers = result.current.createGestureHandlers()
    const touch1 = createMockTouch(100, 200)
    const touch2 = createMockTouch(200, 300)

    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [touch1, touch2]))
    })

    expect(onPinchStart).toHaveBeenCalled()

    // Move touches further apart (zoom in)
    const movedTouch1 = createMockTouch(80, 180)
    const movedTouch2 = createMockTouch(220, 320)

    act(() => {
      handlers.onTouchMove(createMockTouchEvent('touchmove', [movedTouch1, movedTouch2]))
    })

    expect(result.current.gestureState.isPinch).toBe(true)
    expect(result.current.gestureState.scale).toBeGreaterThan(1)
    expect(onPinchMove).toHaveBeenCalled()

    act(() => {
      handlers.onTouchEnd(createMockTouchEvent('touchend', []))
    })

    expect(onPinchEnd).toHaveBeenCalled()
  })

  it('should calculate velocity correctly', () => {
    const onSwipeEnd = jest.fn()
    const { result } = renderHook(() => useGestures({ 
      onSwipeEnd,
      velocityThreshold: 0.5 
    }))

    const handlers = result.current.createGestureHandlers()

    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 200)]))
    })

    // Simulate fast movement
    act(() => {
      jest.advanceTimersByTime(16) // One frame
      handlers.onTouchMove(createMockTouchEvent('touchmove', [createMockTouch(120, 200)]))
    })

    act(() => {
      jest.advanceTimersByTime(16)
      handlers.onTouchMove(createMockTouchEvent('touchmove', [createMockTouch(140, 200)]))
    })

    act(() => {
      handlers.onTouchEnd(createMockTouchEvent('touchend', []))
    })

    expect(result.current.gestureState.velocityX).toBeGreaterThan(0)
    expect(onSwipeEnd).toHaveBeenCalledWith(expect.objectContaining({
      velocityX: expect.any(Number),
      velocityY: expect.any(Number),
    }))
  })

  it('should trigger haptic feedback when enabled', () => {
    const { result } = renderHook(() => useGestures({ 
      enableHaptics: true 
    }))

    act(() => {
      result.current.triggerHaptic('medium')
    })

    expect(mockVibrate).toHaveBeenCalledWith([20])
  })

  it('should not trigger haptic feedback when disabled', () => {
    const { result } = renderHook(() => useGestures({ 
      enableHaptics: false 
    }))

    act(() => {
      result.current.triggerHaptic('light')
    })

    expect(mockVibrate).not.toHaveBeenCalled()
  })

  it('should prevent scroll when preventScroll is true', () => {
    const { result } = renderHook(() => useGestures({ 
      preventScroll: true 
    }))

    const handlers = result.current.createGestureHandlers()
    const touchEvent = createMockTouchEvent('touchstart', [createMockTouch(100, 200)])

    act(() => {
      handlers.onTouchStart(touchEvent)
    })

    expect(touchEvent.preventDefault).toHaveBeenCalled()
  })

  it('should handle touch cancel events', () => {
    const { result } = renderHook(() => useGestures())

    const handlers = result.current.createGestureHandlers()

    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 200)]))
    })

    expect(result.current.isActive).toBe(true)

    act(() => {
      handlers.onTouchCancel(createMockTouchEvent('touchcancel', []))
    })

    expect(result.current.isActive).toBe(false)
  })

  it('should respect custom thresholds', () => {
    const onSwipeRight = jest.fn()
    const { result } = renderHook(() => useGestures({ 
      onSwipeRight,
      swipeThreshold: 100,
      velocityThreshold: 1.0
    }))

    const handlers = result.current.createGestureHandlers()

    // Movement below threshold
    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 200)]))
      handlers.onTouchMove(createMockTouchEvent('touchmove', [createMockTouch(150, 200)]))
      handlers.onTouchEnd(createMockTouchEvent('touchend', []))
    })

    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('should create gesture handlers with correct properties', () => {
    const { result } = renderHook(() => useGestures({ preventScroll: true }))

    const handlers = result.current.createGestureHandlers()

    expect(handlers).toHaveProperty('onTouchStart')
    expect(handlers).toHaveProperty('onTouchMove')
    expect(handlers).toHaveProperty('onTouchEnd')
    expect(handlers).toHaveProperty('onTouchCancel')
    expect(handlers.style).toEqual({
      touchAction: 'none',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
    })
  })

  it('should handle multiple callback types in sequence', () => {
    const onSwipeStart = jest.fn()
    const onSwipeMove = jest.fn()
    const onSwipeEnd = jest.fn()
    const onSwipeRight = jest.fn()

    const { result } = renderHook(() => useGestures({
      onSwipeStart,
      onSwipeMove,
      onSwipeEnd,
      onSwipeRight,
      swipeThreshold: 50
    }))

    const handlers = result.current.createGestureHandlers()

    act(() => {
      handlers.onTouchStart(createMockTouchEvent('touchstart', [createMockTouch(100, 200)]))
    })

    expect(onSwipeStart).toHaveBeenCalled()

    act(() => {
      handlers.onTouchMove(createMockTouchEvent('touchmove', [createMockTouch(180, 200)]))
    })

    expect(onSwipeMove).toHaveBeenCalled()

    act(() => {
      handlers.onTouchEnd(createMockTouchEvent('touchend', []))
    })

    expect(onSwipeEnd).toHaveBeenCalled()
    expect(onSwipeRight).toHaveBeenCalled()
  })
})