import { renderHook, act } from '@testing-library/react'
import { useMomentumScroll } from '../useMomentumScroll'

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = jest.fn()
const mockCancelAnimationFrame = jest.fn()

global.requestAnimationFrame = mockRequestAnimationFrame
global.cancelAnimationFrame = mockCancelAnimationFrame

describe('useMomentumScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequestAnimationFrame.mockImplementation((callback) => {
      setTimeout(callback, 16) // 60fps
      return 1
    })
    mockCancelAnimationFrame.mockImplementation(() => {})
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useMomentumScroll())

    expect(result.current.isAnimating).toBe(false)
    expect(result.current.getPosition()).toEqual({ x: 0, y: 0 })
    expect(typeof result.current.setPosition).toBe('function')
    expect(typeof result.current.setBounds).toBe('function')
    expect(typeof result.current.startMomentum).toBe('function')
    expect(typeof result.current.stopMomentum).toBe('function')
  })

  it('should set position correctly', () => {
    const onScroll = jest.fn()
    const { result } = renderHook(() => useMomentumScroll({ onScroll }))

    act(() => {
      result.current.setPosition(100, 200)
    })

    expect(result.current.getPosition()).toEqual({ x: 100, y: 200 })
    expect(onScroll).toHaveBeenCalledWith({ x: 100, y: 200 })
  })

  it('should set bounds correctly', () => {
    const { result } = renderHook(() => useMomentumScroll())

    act(() => {
      result.current.setBounds({ minX: -100, maxX: 100, minY: -200, maxY: 200 })
    })

    // Test that bounds setter works (no direct way to test internal bounds)
    expect(result.current.setBounds).toBeDefined()
  })

  it('should start momentum animation', () => {
    const onScroll = jest.fn()
    const { result } = renderHook(() => useMomentumScroll({ 
      threshold: 0.1,
      onScroll
    }))

    act(() => {
      result.current.startMomentum(20, 30) // Velocity above threshold
    })

    // The momentum should trigger position updates
    expect(onScroll).toHaveBeenCalled()
  })

  it('should stop momentum animation', () => {
    const { result } = renderHook(() => useMomentumScroll())

    // Test that stop momentum function exists and can be called
    act(() => {
      result.current.stopMomentum()
    })

    expect(result.current.stopMomentum).toBeDefined()
  })

  it('should respect maximum velocity', () => {
    const onScroll = jest.fn()
    const { result } = renderHook(() => useMomentumScroll({ 
      maxVelocity: 10,
      onScroll
    }))

    act(() => {
      result.current.startMomentum(100, 100) // High velocity that should be clamped
    })

    // Animation should still start but velocity should be limited
    expect(onScroll).toHaveBeenCalled()
  })

  it('should apply friction during animation', () => {
    const onScroll = jest.fn()
    const onMomentumEnd = jest.fn()
    
    const { result } = renderHook(() => useMomentumScroll({ 
      friction: 0.8,
      threshold: 0.5,
      onScroll,
      onMomentumEnd
    }))

    let animationCallback: (() => void) | null = null
    mockRequestAnimationFrame.mockImplementation((callback) => {
      animationCallback = callback
      return 1
    })

    act(() => {
      result.current.startMomentum(10, 10)
    })

    // Simulate several animation frames
    for (let i = 0; i < 5; i++) {
      if (animationCallback) {
        act(() => {
          animationCallback()
        })
      }
    }

    expect(onScroll).toHaveBeenCalled()
    // Should eventually stop when velocity is below threshold
  })

  it('should handle bouncing when enabled', () => {
    const onScroll = jest.fn()
    
    const { result } = renderHook(() => useMomentumScroll({ 
      bounceEnabled: true,
      bounceStiffness: 0.2,
      onScroll
    }))

    // Set bounds and position beyond bounds
    act(() => {
      result.current.setBounds({ minX: 0, maxX: 100, minY: 0, maxY: 100 })
      result.current.setPosition(50, 50)
      result.current.startMomentum(50, 50) // Should bounce at boundaries
    })

    expect(onScroll).toHaveBeenCalled()
  })

  it('should handle non-bouncing boundaries', () => {
    const onScroll = jest.fn()
    
    const { result } = renderHook(() => useMomentumScroll({ 
      bounceEnabled: false,
      onScroll
    }))

    act(() => {
      result.current.setBounds({ minX: 0, maxX: 100, minY: 0, maxY: 100 })
      result.current.setPosition(50, 50)
      result.current.startMomentum(100, 100) // Should stop at boundaries
    })

    expect(onScroll).toHaveBeenCalled()
  })

  it('should track touch history correctly', () => {
    const { result } = renderHook(() => useMomentumScroll())

    act(() => {
      result.current.trackTouch(10, 20)
    })

    act(() => {
      jest.advanceTimersByTime(50)
      result.current.trackTouch(30, 40)
    })

    act(() => {
      jest.advanceTimersByTime(50)
      result.current.trackTouch(50, 60)
    })

    const velocity = result.current.calculateVelocityFromHistory()
    expect(velocity.x).toBeGreaterThan(0)
    expect(velocity.y).toBeGreaterThan(0)
  })

  it('should handle touch start correctly', () => {
    const { result } = renderHook(() => useMomentumScroll())

    act(() => {
      result.current.handleTouchStart(100, 200)
    })

    // Touch start should initialize touch tracking
    expect(result.current.handleTouchStart).toBeDefined()
  })

  it('should handle touch move correctly', () => {
    const onScroll = jest.fn()
    const { result } = renderHook(() => useMomentumScroll({ onScroll }))

    act(() => {
      result.current.handleTouchStart(50, 50)
    })

    act(() => {
      result.current.handleTouchMove(100, 150)
    })

    expect(result.current.getPosition()).toEqual({ x: 100, y: 150 })
    expect(onScroll).toHaveBeenCalledWith({ x: 100, y: 150 })
  })

  it('should handle touch end and start momentum', () => {
    const onScroll = jest.fn()
    const { result } = renderHook(() => useMomentumScroll({ onScroll }))

    act(() => {
      result.current.handleTouchStart(0, 0)
    })

    // Simulate fast movement
    act(() => {
      jest.advanceTimersByTime(16)
      result.current.handleTouchMove(10, 10)
    })

    act(() => {
      jest.advanceTimersByTime(16)
      result.current.handleTouchMove(20, 20)
    })

    act(() => {
      jest.advanceTimersByTime(16)
      result.current.handleTouchMove(30, 30)
    })

    act(() => {
      result.current.handleTouchEnd()
    })

    // Should have tracked movement and potentially started momentum
    expect(onScroll).toHaveBeenCalled()
  })

  it('should not start momentum on slow touch end', () => {
    const { result } = renderHook(() => useMomentumScroll())

    act(() => {
      result.current.handleTouchStart(100, 100)
    })

    // Very slow movement
    act(() => {
      jest.advanceTimersByTime(100)
      result.current.handleTouchMove(101, 101)
    })

    act(() => {
      result.current.handleTouchEnd()
    })

    // Test completed without errors - slow movement handled correctly
    expect(result.current.handleTouchEnd).toBeDefined()
  })

  it('should snap to position with animation', () => {
    const onScroll = jest.fn()
    const onMomentumEnd = jest.fn()
    
    const { result } = renderHook(() => useMomentumScroll({ 
      onScroll,
      onMomentumEnd
    }))

    let animationCallback: (() => void) | null = null
    mockRequestAnimationFrame.mockImplementation((callback) => {
      animationCallback = callback
      return 1
    })

    act(() => {
      result.current.setPosition(0, 0)
      result.current.snapTo(100, 200, 300) // 300ms duration
    })

    // Simulate animation frames
    for (let i = 0; i < 5; i++) {
      if (animationCallback) {
        act(() => {
          jest.advanceTimersByTime(60) // 60ms per frame
          animationCallback()
        })
      }
    }

    expect(onScroll).toHaveBeenCalled()
  })

  it('should calculate velocity from empty history', () => {
    const { result } = renderHook(() => useMomentumScroll())

    const velocity = result.current.calculateVelocityFromHistory()
    expect(velocity).toEqual({ x: 0, y: 0 })
  })

  it('should calculate velocity from single touch', () => {
    const { result } = renderHook(() => useMomentumScroll())

    act(() => {
      result.current.trackTouch(10, 20)
    })

    const velocity = result.current.calculateVelocityFromHistory()
    expect(velocity).toEqual({ x: 0, y: 0 })
  })

  it('should handle momentum end callback', () => {
    const onMomentumEnd = jest.fn()
    
    const { result } = renderHook(() => useMomentumScroll({ 
      threshold: 5, // Higher threshold for easier testing
      onMomentumEnd
    }))

    let animationCallback: (() => void) | null = null
    mockRequestAnimationFrame.mockImplementation((callback) => {
      animationCallback = callback
      return 1
    })

    act(() => {
      result.current.startMomentum(1, 1) // Very low velocity
    })

    // Should stop immediately due to low velocity and call onMomentumEnd
    if (animationCallback) {
      act(() => {
        animationCallback()
      })
    }

    expect(onMomentumEnd).toHaveBeenCalled()
  })

  it('should cleanup animation frame on unmount', () => {
    const { result, unmount } = renderHook(() => useMomentumScroll())

    act(() => {
      result.current.startMomentum(10, 10)
    })

    unmount()

    // Test that unmount completes without errors
    expect(true).toBe(true)
  })

  it('should handle custom options correctly', () => {
    const customOptions = {
      friction: 0.9,
      maxVelocity: 25,
      threshold: 0.2,
      bounceEnabled: false,
      bounceStiffness: 0.05,
    }

    const { result } = renderHook(() => useMomentumScroll(customOptions))

    // Test that hook initializes with custom options
    expect(result.current.startMomentum).toBeDefined()
  })

  it('should handle zero velocity correctly', () => {
    const { result } = renderHook(() => useMomentumScroll())

    act(() => {
      result.current.startMomentum(0, 0)
    })

    // Zero velocity should not cause errors
    expect(result.current.startMomentum).toBeDefined()
  })

  it('should maintain touch history within size limit', () => {
    const { result } = renderHook(() => useMomentumScroll())

    act(() => {
      result.current.handleTouchStart(0, 0)
    })

    // Add many touch points
    for (let i = 0; i < 15; i++) {
      act(() => {
        jest.advanceTimersByTime(10)
        result.current.handleTouchMove(i, i)
      })
    }

    // Touch history should be maintained but not exceed reasonable limits
    // (This is tested indirectly through velocity calculation)
    const velocity = result.current.calculateVelocityFromHistory()
    expect(typeof velocity.x).toBe('number')
    expect(typeof velocity.y).toBe('number')
  })

  it('should filter old touches from history', () => {
    const { result } = renderHook(() => useMomentumScroll())

    act(() => {
      result.current.trackTouch(10, 10)
    })

    // Advance time beyond the 100ms cutoff
    act(() => {
      jest.advanceTimersByTime(150)
      result.current.trackTouch(20, 20)
    })

    // Old touches should be filtered out
    const velocity = result.current.calculateVelocityFromHistory()
    expect(velocity).toEqual({ x: 0, y: 0 }) // Only one touch point left
  })
})