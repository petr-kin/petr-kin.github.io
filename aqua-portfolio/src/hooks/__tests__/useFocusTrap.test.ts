import { renderHook, act } from '@testing-library/react'
import { useFocusTrap } from '../useFocusTrap'

// Mock DOM methods
const mockFocus = jest.fn()
const mockQuerySelectorAll = jest.fn()
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()

// Create mock elements
const createMockElement = (tag: string, focusable = true) => ({
  tagName: tag.toUpperCase(),
  focus: mockFocus,
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  getAttribute: jest.fn((attr) => {
    if (attr === 'tabindex') return focusable ? '0' : '-1'
    if (attr === 'disabled') return focusable ? null : 'true'
    return null
  }),
  hasAttribute: jest.fn((attr) => {
    if (attr === 'disabled') return !focusable
    return false
  }),
  offsetWidth: focusable ? 100 : 0,
  offsetHeight: focusable ? 20 : 0,
  getClientRects: jest.fn(() => focusable ? [{ width: 100, height: 20 }] : []),
})

describe('useFocusTrap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFocus.mockClear()
    mockQuerySelectorAll.mockClear()
    mockAddEventListener.mockClear()
    mockRemoveEventListener.mockClear()

    // Reset document methods
    Object.defineProperty(document, 'activeElement', {
      writable: true,
      value: document.body,
    })
  })

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useFocusTrap())

    expect(result.current.trapRef.current).toBe(null)
    expect(typeof result.current.activate).toBe('function')
    expect(typeof result.current.deactivate).toBe('function')
  })

  it('should activate focus trap when element is set', () => {
    const { result } = renderHook(() => useFocusTrap({ active: true }))

    const mockContainer = createMockElement('div')
    const mockButton = createMockElement('button')
    const mockInput = createMockElement('input')

    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([mockButton, mockInput])

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('should focus first element when activated', () => {
    const { result } = renderHook(() => useFocusTrap({ active: true, autoFocus: true }))

    const mockContainer = createMockElement('div')
    const mockButton = createMockElement('button')
    const mockInput = createMockElement('input')

    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([mockButton, mockInput])

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    act(() => {
      result.current.activate()
    })

    expect(mockButton.focus).toHaveBeenCalled()
  })

  it('should handle Tab key navigation', () => {
    const { result } = renderHook(() => useFocusTrap({ active: true }))

    const mockContainer = createMockElement('div')
    const mockButton1 = createMockElement('button')
    const mockButton2 = createMockElement('button')
    const mockButton3 = createMockElement('button')

    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([mockButton1, mockButton2, mockButton3])

    // Mock document.activeElement
    Object.defineProperty(document, 'activeElement', {
      writable: true,
      value: mockButton3,
    })

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    // Simulate Tab key press on last element
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
      bubbles: true,
    })

    Object.defineProperty(tabEvent, 'preventDefault', {
      value: jest.fn(),
    })

    // Manually trigger the keydown handler
    act(() => {
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1]
      
      if (keydownHandler) {
        keydownHandler(tabEvent)
      }
    })

    expect(mockButton1.focus).toHaveBeenCalled()
  })

  it('should handle Shift+Tab key navigation', () => {
    const { result } = renderHook(() => useFocusTrap({ active: true }))

    const mockContainer = createMockElement('div')
    const mockButton1 = createMockElement('button')
    const mockButton2 = createMockElement('button')

    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([mockButton1, mockButton2])

    // Mock document.activeElement as first element
    Object.defineProperty(document, 'activeElement', {
      writable: true,
      value: mockButton1,
    })

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    // Simulate Shift+Tab key press on first element
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
    })

    Object.defineProperty(shiftTabEvent, 'preventDefault', {
      value: jest.fn(),
    })

    act(() => {
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1]
      
      if (keydownHandler) {
        keydownHandler(shiftTabEvent)
      }
    })

    expect(mockButton2.focus).toHaveBeenCalled()
  })

  it('should handle Escape key when closeOnEscape is true', () => {
    const onClose = jest.fn()
    const { result } = renderHook(() => 
      useFocusTrap({ 
        active: true, 
        closeOnEscape: true,
        onClose 
      })
    )

    const mockContainer = createMockElement('div')
    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([])

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })

    act(() => {
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1]
      
      if (keydownHandler) {
        keydownHandler(escapeEvent)
      }
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('should ignore non-focusable elements', () => {
    const { result } = renderHook(() => useFocusTrap({ active: true }))

    const mockContainer = createMockElement('div')
    const mockButton = createMockElement('button', true)
    const mockDisabledInput = createMockElement('input', false)
    const mockHiddenDiv = createMockElement('div', false)

    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([mockButton, mockDisabledInput, mockHiddenDiv])

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    act(() => {
      result.current.activate()
    })

    // Should only focus the button, not disabled/hidden elements
    expect(mockButton.focus).toHaveBeenCalled()
    expect(mockDisabledInput.focus).not.toHaveBeenCalled()
    expect(mockHiddenDiv.focus).not.toHaveBeenCalled()
  })

  it('should restore focus on deactivation', () => {
    const originalElement = createMockElement('button')
    Object.defineProperty(document, 'activeElement', {
      writable: true,
      value: originalElement,
    })

    const { result } = renderHook(() => 
      useFocusTrap({ 
        active: true, 
        restoreFocus: true 
      })
    )

    const mockContainer = createMockElement('div')
    const mockInput = createMockElement('input')

    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([mockInput])

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    act(() => {
      result.current.deactivate()
    })

    expect(originalElement.focus).toHaveBeenCalled()
  })

  it('should cleanup event listeners on unmount', () => {
    const { result, unmount } = renderHook(() => useFocusTrap({ active: true }))

    const mockContainer = createMockElement('div')
    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([])

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('should handle focus within trap boundary', () => {
    const { result } = renderHook(() => useFocusTrap({ active: true }))

    const mockContainer = createMockElement('div')
    const mockButton1 = createMockElement('button')
    const mockButton2 = createMockElement('button')

    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([mockButton1, mockButton2])
    
    // Mock contains method
    mockContainer.contains = jest.fn().mockReturnValue(true)

    Object.defineProperty(document, 'activeElement', {
      writable: true,
      value: mockButton1,
    })

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    // Simulate Tab from first to second button (normal navigation)
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
    })

    Object.defineProperty(tabEvent, 'preventDefault', {
      value: jest.fn(),
    })

    act(() => {
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1]
      
      if (keydownHandler) {
        keydownHandler(tabEvent)
      }
    })

    // Should not prevent default for normal navigation within trap
    expect(tabEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('should handle empty focusable elements list', () => {
    const { result } = renderHook(() => useFocusTrap({ active: true, autoFocus: true }))

    const mockContainer = createMockElement('div')
    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([])

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    // Should not throw error when no focusable elements
    expect(() => {
      act(() => {
        result.current.activate()
      })
    }).not.toThrow()
  })

  it('should work with dynamic content', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap({ active }),
      { initialProps: { active: false } }
    )

    const mockContainer = createMockElement('div')
    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([])

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    // Initially inactive
    expect(mockAddEventListener).not.toHaveBeenCalled()

    // Activate
    rerender({ active: true })

    expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))

    // Deactivate
    rerender({ active: false })

    expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('should handle custom focusable selector', () => {
    const customSelector = 'input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const { result } = renderHook(() => 
      useFocusTrap({ 
        active: true,
        focusableSelector: customSelector
      })
    )

    const mockContainer = createMockElement('div')
    mockContainer.querySelectorAll = mockQuerySelectorAll
    mockQuerySelectorAll.mockReturnValue([])

    act(() => {
      result.current.trapRef.current = mockContainer as any
    })

    expect(mockQuerySelectorAll).toHaveBeenCalledWith(customSelector)
  })
})