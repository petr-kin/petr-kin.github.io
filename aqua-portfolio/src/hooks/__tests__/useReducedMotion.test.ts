import { renderHook, act } from '@testing-library/react'
import { useReducedMotion, useMotionPreferences, useAnimationConfig, useMotionCSS } from '../useReducedMotion'

// Mock matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

describe('useReducedMotion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset matchMedia mock
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
  })

  it('should initialize with false when user prefers motion', () => {
    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('should initialize with true when user prefers reduced motion', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(true)
  })

  it('should add event listener for changes', () => {
    const mockAddEventListener = jest.fn()
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn(),
    })

    renderHook(() => useReducedMotion())

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should cleanup event listener on unmount', () => {
    const mockRemoveEventListener = jest.fn()
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: mockRemoveEventListener,
    })

    const { unmount } = renderHook(() => useReducedMotion())

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should handle server-side rendering', () => {
    // Mock window as undefined
    const originalWindow = global.window
    delete (global as any).window

    const { result } = renderHook(() => useReducedMotion())

    // Should default to false
    expect(result.current).toBe(false)

    // Restore window
    global.window = originalWindow
  })
})

describe('useMotionPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))
  })

  it('should initialize with all preferences false', () => {
    const { result } = renderHook(() => useMotionPreferences())

    expect(result.current).toEqual({
      prefersReducedMotion: false,
      prefersReducedTransparency: false,
      prefersHighContrast: false,
    })
  })

  it('should query all media preferences', () => {
    renderHook(() => useMotionPreferences())

    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-transparency: reduce)')
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: high)')
  })

  it('should return true values when preferences match', () => {
    mockMatchMedia.mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))

    const { result } = renderHook(() => useMotionPreferences())

    expect(result.current).toEqual({
      prefersReducedMotion: true,
      prefersReducedTransparency: true,
      prefersHighContrast: true,
    })
  })
})

describe('useAnimationConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
  })

  it('should provide normal animation config when motion is preferred', () => {
    const { result } = renderHook(() => useAnimationConfig())

    expect(result.current.prefersReducedMotion).toBe(false)
    expect(result.current.transition).toEqual({ type: 'spring', damping: 20, stiffness: 300 })
    expect(result.current.duration).toBe(300)
    expect(result.current.ease).toBe('easeInOut')
  })

  it('should provide reduced animation config when motion is not preferred', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })

    const { result } = renderHook(() => useAnimationConfig())

    expect(result.current.prefersReducedMotion).toBe(true)
    expect(result.current.transition).toEqual({ duration: 0 })
    expect(result.current.duration).toBe(0)
    expect(result.current.ease).toBe('linear')
  })

  it('should provide getVariant function', () => {
    const { result } = renderHook(() => useAnimationConfig())

    const normalVariant = { scale: 1.2 }
    const reducedVariant = { scale: 1.0 }

    expect(typeof result.current.getVariant).toBe('function')
    
    // When motion is preferred, should return normal variant
    expect(result.current.getVariant(normalVariant, reducedVariant)).toBe(normalVariant)
  })

  it('should return reduced variant when motion is reduced', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })

    const { result } = renderHook(() => useAnimationConfig())

    const normalVariant = { scale: 1.2 }
    const reducedVariant = { scale: 1.0 }

    expect(result.current.getVariant(normalVariant, reducedVariant)).toBe(reducedVariant)
  })
})

describe('useMotionCSS', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
  })

  it('should provide normal CSS when motion is preferred', () => {
    const { result } = renderHook(() => useMotionCSS())

    expect(result.current).toEqual({
      transition: undefined,
      animationDuration: undefined,
      animationIterationCount: undefined,
    })
  })

  it('should provide reduced motion CSS when motion is not preferred', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })

    const { result } = renderHook(() => useMotionCSS())

    expect(result.current).toEqual({
      transition: 'none',
      animationDuration: '0ms',
      animationIterationCount: '1',
    })
  })
})