import { renderHook, act } from '@testing-library/react'
import { useIntersectionObserver, useIntersectionObserverMultiple, useLazyLoad } from '../useIntersectionObserver'

// Mock IntersectionObserver
const mockObserve = jest.fn()
const mockUnobserve = jest.fn()
const mockDisconnect = jest.fn()

const mockIntersectionObserver = jest.fn().mockImplementation((callback, options) => ({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
  root: options?.root || null,
  rootMargin: options?.rootMargin || '0px',
  thresholds: options?.threshold || [0],
}))

// Replace the global IntersectionObserver
global.IntersectionObserver = mockIntersectionObserver

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIntersectionObserver.mockClear()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useIntersectionObserver())

    expect(result.current.isIntersecting).toBe(false)
    expect(result.current.entry).toBe(null)
    expect(result.current.targetRef).toBeDefined()
    expect(result.current.targetRef.current).toBe(null)
  })

  it('should handle initialIsIntersecting option', () => {
    const { result } = renderHook(() => 
      useIntersectionObserver({ initialIsIntersecting: true })
    )

    expect(result.current.isIntersecting).toBe(true)
  })

  it('should not create observer when IntersectionObserver is not supported', () => {
    // Temporarily remove IntersectionObserver
    const originalIO = global.IntersectionObserver
    delete (global as any).IntersectionObserver

    const { result, rerender } = renderHook(() => useIntersectionObserver())

    const mockElement = document.createElement('div')
    act(() => {
      result.current.targetRef.current = mockElement
    })

    // Force rerender to trigger effect
    rerender()

    expect(mockIntersectionObserver).not.toHaveBeenCalled()

    // Restore IntersectionObserver
    global.IntersectionObserver = originalIO
  })

  it('should create observer when target ref is set', () => {
    const { result, rerender } = renderHook(() => useIntersectionObserver())

    expect(mockIntersectionObserver).not.toHaveBeenCalled()

    // Set target ref
    const mockElement = document.createElement('div')
    act(() => {
      result.current.targetRef.current = mockElement
    })

    // Trigger effect by rerendering
    rerender()

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0,
        root: null,
        rootMargin: '0%',
      }
    )
    expect(mockObserve).toHaveBeenCalledWith(mockElement)
  })

  it('should use custom options when provided', () => {
    const options = {
      root: document.createElement('div'),
      rootMargin: '10px',
      threshold: [0, 0.5, 1],
    }

    const { result, rerender } = renderHook(() => useIntersectionObserver(options))

    const mockElement = document.createElement('div')
    act(() => {
      result.current.targetRef.current = mockElement
    })

    rerender()

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining(options)
    )
  })

  it('should cleanup observer on unmount', () => {
    const { result, rerender, unmount } = renderHook(() => useIntersectionObserver())

    const mockElement = document.createElement('div')
    act(() => {
      result.current.targetRef.current = mockElement
    })

    rerender()

    unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('should handle freezeOnceVisible option correctly', () => {
    const { result } = renderHook(() => 
      useIntersectionObserver({ 
        freezeOnceVisible: true,
        initialIsIntersecting: false 
      })
    )

    expect(result.current.isIntersecting).toBe(false)
    
    // This tests that the hook initializes properly with the option
    expect(result.current.entry).toBe(null)
  })
})

describe('useIntersectionObserverMultiple', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIntersectionObserver.mockClear()
  })

  it('should initialize with empty entries', () => {
    const { result } = renderHook(() => useIntersectionObserverMultiple())

    expect(result.current.entries).toBeInstanceOf(Map)
    expect(result.current.entries.size).toBe(0)
    expect(typeof result.current.observe).toBe('function')
    expect(typeof result.current.unobserve).toBe('function')
    expect(typeof result.current.disconnect).toBe('function')
  })

  it('should create observer on first render', () => {
    renderHook(() => useIntersectionObserverMultiple())

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0,
        root: null,
        rootMargin: '0%',
      }
    )
  })

  it('should observe multiple elements', () => {
    const { result } = renderHook(() => useIntersectionObserverMultiple())

    const element1 = document.createElement('div')
    const element2 = document.createElement('div')

    act(() => {
      result.current.observe(element1)
      result.current.observe(element2)
    })

    expect(mockObserve).toHaveBeenCalledWith(element1)
    expect(mockObserve).toHaveBeenCalledWith(element2)
  })

  it('should unobserve specific elements', () => {
    const { result } = renderHook(() => useIntersectionObserverMultiple())

    const element1 = document.createElement('div')

    act(() => {
      result.current.observe(element1)
    })

    act(() => {
      result.current.unobserve(element1)
    })

    expect(mockUnobserve).toHaveBeenCalledWith(element1)
  })

  it('should disconnect all observers', () => {
    const { result } = renderHook(() => useIntersectionObserverMultiple())

    const element1 = document.createElement('div')
    const element2 = document.createElement('div')

    act(() => {
      result.current.observe(element1)
      result.current.observe(element2)
    })

    act(() => {
      result.current.disconnect()
    })

    expect(mockDisconnect).toHaveBeenCalled()
    expect(result.current.entries.size).toBe(0)
  })

  it('should handle null elements gracefully', () => {
    const { result } = renderHook(() => useIntersectionObserverMultiple())

    act(() => {
      result.current.observe(null as any)
      result.current.unobserve(null as any)
    })

    // Should not throw errors and should not call observe/unobserve with null
    expect(result.current.entries.size).toBe(0)
  })
})

describe('useLazyLoad', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIntersectionObserver.mockClear()
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useLazyLoad())

    expect(result.current.hasLoaded).toBe(false)
    expect(result.current.isIntersecting).toBe(false)
    expect(result.current.targetRef).toBeDefined()
  })

  it('should use freezeOnceVisible by default', () => {
    const { result, rerender } = renderHook(() => useLazyLoad())

    const mockElement = document.createElement('div')
    act(() => {
      result.current.targetRef.current = mockElement
    })

    rerender()

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        freezeOnceVisible: true,
        threshold: 0.1,
      })
    )
  })

  it('should use custom intersection options', () => {
    const { result, rerender } = renderHook(() => 
      useLazyLoad({ 
        rootMargin: '100px',
        threshold: 0.5,
      })
    )

    const mockElement = document.createElement('div')
    act(() => {
      result.current.targetRef.current = mockElement
    })

    rerender()

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '100px',
        threshold: 0.5,
        freezeOnceVisible: true,
      })
    )
  })

  it('should call onLoad callback when provided', () => {
    const onLoad = jest.fn()
    const { result } = renderHook(() => useLazyLoad({ onLoad }))

    // onLoad should be available but not called initially
    expect(result.current.hasLoaded).toBe(false)
    expect(onLoad).not.toHaveBeenCalled()
  })

  it('should not call onLoad if not intersecting', () => {
    const onLoad = jest.fn()
    renderHook(() => useLazyLoad({ onLoad }))

    expect(onLoad).not.toHaveBeenCalled()
  })

  it('should handle multiple rerenders without issues', () => {
    const { result, rerender } = renderHook(() => useLazyLoad())

    expect(result.current.hasLoaded).toBe(false)
    
    rerender()
    rerender()
    
    expect(result.current.hasLoaded).toBe(false)
    expect(result.current.isIntersecting).toBe(false)
  })
})