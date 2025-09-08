import { renderHook, act } from '@testing-library/react'
import { useMobileOptimization } from '../useMobileOptimization'

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
})

// Mock window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  configurable: true,
  value: 1,
})

// Mock navigator.connection
const mockConnection = {
  effectiveType: '4g' as const,
  downlink: 10,
  rtt: 100,
  saveData: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}

Object.defineProperty(navigator, 'connection', {
  get: () => mockConnection,
  configurable: true,
})

describe('useMobileOptimization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset to desktop defaults
    window.innerWidth = 1024
    window.innerHeight = 768
    
    // Reset connection mock
    Object.assign(mockConnection, {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
    })
  })

  it('should initialize with device info', () => {
    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo).toBeDefined()
    expect(result.current.optimizations).toBeDefined()
    expect(typeof result.current.deviceInfo.isMobile).toBe('boolean')
    expect(typeof result.current.deviceInfo.isTablet).toBe('boolean')
    expect(typeof result.current.deviceInfo.isDesktop).toBe('boolean')
  })

  it('should detect screen dimensions', () => {
    window.innerWidth = 375
    window.innerHeight = 812

    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo.screenWidth).toBe(375)
    expect(result.current.deviceInfo.screenHeight).toBe(812)
  })

  it('should detect pixel ratio', () => {
    window.devicePixelRatio = 2

    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo.pixelRatio).toBe(2)
  })

  it('should detect orientation', () => {
    window.innerWidth = 375
    window.innerHeight = 812

    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo.orientation).toBe('portrait')
  })

  it('should detect landscape orientation', () => {
    window.innerWidth = 812
    window.innerHeight = 375

    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo.orientation).toBe('landscape')
  })

  it('should detect fast connection', () => {
    Object.assign(mockConnection, {
      effectiveType: '4g',
      downlink: 10,
    })

    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo.connectionType).toBe('fast')
  })

  it('should detect slow connection', () => {
    Object.assign(mockConnection, {
      effectiveType: '2g',
      downlink: 0.5,
    })

    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo.connectionType).toBe('slow')
  })

  it('should detect offline connection', () => {
    const originalOnline = navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo.connectionType).toBe('offline')

    // Restore original value
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnline,
    })
  })

  it('should handle missing connection API', () => {
    const originalConnection = (navigator as any).connection
    delete (navigator as any).connection

    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo.connectionType).toBe('unknown')

    // Restore connection
    Object.defineProperty(navigator, 'connection', {
      get: () => originalConnection,
      configurable: true,
    })
  })

  it('should provide appropriate optimizations', () => {
    const { result } = renderHook(() => useMobileOptimization())

    expect(typeof result.current.optimizations.reduceAnimations).toBe('boolean')
    expect(typeof result.current.optimizations.reducedParticleCount).toBe('number')
    expect(typeof result.current.optimizations.lowQualityImages).toBe('boolean')
    expect(typeof result.current.optimizations.prefetchDisabled).toBe('boolean')
    expect(typeof result.current.optimizations.lazyLoadingAggressive).toBe('boolean')
  })

  it('should handle window resize', () => {
    const { result } = renderHook(() => useMobileOptimization())

    expect(result.current.deviceInfo.screenWidth).toBe(1024)

    // Simulate window resize
    act(() => {
      window.innerWidth = 375
      window.innerHeight = 812
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.deviceInfo.screenWidth).toBe(375)
    expect(result.current.deviceInfo.screenHeight).toBe(812)
  })

  it('should cleanup resize listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    
    const { unmount } = renderHook(() => useMobileOptimization())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    
    removeEventListenerSpy.mockRestore()
  })

  it('should detect touch capability', () => {
    const { result } = renderHook(() => useMobileOptimization())

    expect(typeof result.current.deviceInfo.isTouchDevice).toBe('boolean')
  })

  it('should handle different screen sizes', () => {
    const testCases = [
      { width: 320, height: 568, expectMobile: true },
      { width: 768, height: 1024, expectTablet: true },
      { width: 1920, height: 1080, expectDesktop: true },
    ]

    testCases.forEach(({ width, height, expectMobile, expectTablet, expectDesktop }) => {
      window.innerWidth = width
      window.innerHeight = height
      
      const { result } = renderHook(() => useMobileOptimization())
      
      if (expectMobile) {
        expect(result.current.deviceInfo.screenWidth).toBe(width)
      } else if (expectTablet) {
        expect(result.current.deviceInfo.screenWidth).toBe(width)
      } else if (expectDesktop) {
        expect(result.current.deviceInfo.screenWidth).toBe(width)
      }
    })
  })

  it('should optimize for slow connections', () => {
    Object.assign(mockConnection, {
      effectiveType: '2g',
      downlink: 0.5,
      saveData: true,
    })

    const { result } = renderHook(() => useMobileOptimization())

    // Should enable optimizations for slow connections
    expect(result.current.optimizations.reduceAnimations).toBe(true)
    expect(result.current.optimizations.lowQualityImages).toBe(true)
    expect(result.current.optimizations.lazyLoadingAggressive).toBe(true)
    expect(result.current.optimizations.prefetchDisabled).toBe(true)
  })

  it('should optimize for mobile devices based on screen size', () => {
    window.innerWidth = 375
    window.innerHeight = 812

    const { result } = renderHook(() => useMobileOptimization())

    // Mobile screen size should trigger some optimizations
    expect(result.current.optimizations.reducedParticleCount).toBeLessThan(100)
  })

  it('should handle rapid resize events', () => {
    const { result } = renderHook(() => useMobileOptimization())
    
    const initialWidth = result.current.deviceInfo.screenWidth
    
    // Trigger multiple rapid resize events
    act(() => {
      window.innerWidth = 300
      window.dispatchEvent(new Event('resize'))
      window.innerWidth = 400
      window.dispatchEvent(new Event('resize'))
      window.innerWidth = 500
      window.dispatchEvent(new Event('resize'))
    })
    
    // Should handle the events without throwing
    expect(result.current.deviceInfo.screenWidth).toBe(500)
  })

  it('should handle server-side rendering', () => {
    // Mock window as undefined
    const originalWindow = global.window
    delete (global as any).window

    const { result } = renderHook(() => useMobileOptimization())

    // Should provide default values
    expect(result.current.deviceInfo).toBeDefined()
    expect(result.current.optimizations).toBeDefined()

    // Restore window
    global.window = originalWindow
  })

  it('should detect save data preference', () => {
    Object.assign(mockConnection, {
      saveData: true,
    })

    const { result } = renderHook(() => useMobileOptimization())

    // saveData preference should be reflected
    expect(result.current.optimizations.lowQualityImages).toBe(true)
  })
})