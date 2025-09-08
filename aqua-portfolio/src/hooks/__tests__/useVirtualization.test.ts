import { renderHook, act } from '@testing-library/react'
import { useVirtualization } from '../useVirtualization'

describe('useVirtualization', () => {
  const defaultProps = {
    itemCount: 1000,
    itemHeight: 50,
    containerHeight: 500,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useVirtualization(defaultProps))

    // Should calculate visible items based on container height (500 / 50 = 10 + overscan)
    expect(result.current.virtualItems.length).toBeGreaterThan(0)
    expect(result.current.visibleRange.startIndex).toBe(0)
    expect(result.current.visibleRange.endIndex).toBeGreaterThan(0)
    expect(result.current.totalSize).toBe(50000) // 1000 * 50
    expect(result.current.isScrolling).toBe(false)
    expect(typeof result.current.scrollToItem).toBe('function')
  })

  it('should calculate total size correctly with dynamic heights', () => {
    const getItemHeight = (index: number) => index % 2 === 0 ? 50 : 100
    
    const { result } = renderHook(() => 
      useVirtualization({
        ...defaultProps,
        itemHeight: getItemHeight,
      })
    )

    // Total should be more than 1000 * 50 due to alternating heights
    expect(result.current.totalSize).toBeGreaterThan(50000)
  })

  it('should handle scroll events and update visible range', async () => {
    const mockElement = {
      scrollTop: 0,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }

    const getScrollElement = jest.fn().mockReturnValue(mockElement)

    const { result } = renderHook(() => 
      useVirtualization({
        ...defaultProps,
        getScrollElement,
      })
    )

    // Should add scroll event listener
    expect(mockElement.addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true }
    )

    // Simulate scroll
    await act(async () => {
      mockElement.scrollTop = 250
      const scrollHandler = mockElement.addEventListener.mock.calls[0][1]
      scrollHandler()
    })

    expect(result.current.isScrolling).toBe(true)
  })

  it('should provide scrollToItem functionality', () => {
    const mockElement = {
      scrollTo: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    const getScrollElement = jest.fn().mockReturnValue(mockElement)
    
    const { result } = renderHook(() => 
      useVirtualization({
        ...defaultProps,
        getScrollElement,
      })
    )

    // Test scrolling to item
    result.current.scrollToItem(10, 'start')
    expect(mockElement.scrollTo).toHaveBeenCalledWith({
      top: 500, // 10 * 50
      behavior: 'smooth'
    })

    // Test scrolling to item with center alignment
    result.current.scrollToItem(10, 'center')
    expect(mockElement.scrollTo).toHaveBeenCalledWith({
      top: 275, // 500 - (500 - 50) / 2
      behavior: 'smooth'
    })
  })

  it('should handle overscan correctly', () => {
    const { result } = renderHook(() => 
      useVirtualization({
        ...defaultProps,
        overscan: 3,
      })
    )

    // Should calculate visible items with overscan
    expect(result.current.virtualItems.length).toBeGreaterThan(0)
    expect(result.current.totalSize).toBe(50000)
  })

  it('should cleanup event listeners on unmount', () => {
    const mockElement = {
      scrollTop: 0,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }

    const getScrollElement = jest.fn().mockReturnValue(mockElement)

    const { unmount } = renderHook(() => 
      useVirtualization({
        ...defaultProps,
        getScrollElement,
      })
    )

    unmount()

    expect(mockElement.removeEventListener).toHaveBeenCalled()
  })

  it('should handle edge cases with zero items', () => {
    const { result } = renderHook(() => 
      useVirtualization({
        ...defaultProps,
        itemCount: 0,
      })
    )

    // When itemCount is 0, should handle gracefully
    expect(result.current.totalSize).toBe(0)
    expect(result.current.visibleRange.startIndex).toBe(0)
    expect(result.current.visibleRange.endIndex).toBe(0)
  })

  it('should handle scrollToItem with invalid indices', () => {
    const mockElement = {
      scrollTo: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    const getScrollElement = jest.fn().mockReturnValue(mockElement)

    const { result } = renderHook(() => 
      useVirtualization({
        ...defaultProps,
        getScrollElement,
      })
    )

    // Test with negative index
    result.current.scrollToItem(-1)
    expect(mockElement.scrollTo).not.toHaveBeenCalled()

    // Test with index beyond range
    result.current.scrollToItem(1001)
    expect(mockElement.scrollTo).not.toHaveBeenCalled()
  })

  it('should handle scrollToItem when no scroll element is available', () => {
    const getScrollElement = jest.fn().mockReturnValue(null)

    const { result } = renderHook(() => 
      useVirtualization({
        ...defaultProps,
        getScrollElement,
      })
    )

    // Should not throw error
    expect(() => result.current.scrollToItem(10)).not.toThrow()
  })

  it('should stop scrolling after timeout', async () => {
    jest.useFakeTimers()

    const mockElement = {
      scrollTop: 0,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }

    const getScrollElement = jest.fn().mockReturnValue(mockElement)

    const { result } = renderHook(() => 
      useVirtualization({
        ...defaultProps,
        getScrollElement,
      })
    )

    // Trigger scroll
    await act(async () => {
      mockElement.scrollTop = 100
      const scrollHandler = mockElement.addEventListener.mock.calls[0][1]
      scrollHandler()
    })

    expect(result.current.isScrolling).toBe(true)

    // Fast forward time
    await act(async () => {
      jest.advanceTimersByTime(200)
    })

    expect(result.current.isScrolling).toBe(false)

    jest.useRealTimers()
  })
})