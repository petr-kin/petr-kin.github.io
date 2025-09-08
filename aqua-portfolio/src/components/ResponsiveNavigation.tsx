'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';
import { useViewport } from '@/hooks/useViewport';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useGestures } from '@/hooks/useGestures';

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  children?: NavigationItem[];
  icon?: React.ReactNode;
  disabled?: boolean;
  external?: boolean;
}

export interface ResponsiveNavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  className?: string;
  variant?: 'header' | 'sidebar' | 'bottom';
  showBorder?: boolean;
  sticky?: boolean;
  transparent?: boolean;
  onItemClick?: (item: NavigationItem) => void;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  items,
  logo,
  className = '',
  variant = 'header',
  showBorder = true,
  sticky = true,
  transparent = false,
  onItemClick,
}) => {
  const { isMobile, isTablet, isDesktop, viewport } = useResponsive();
  useViewport({ preventHorizontalScroll: true });
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // Focus trap for mobile menu
  const { trapRef: focusTrapRef } = useFocusTrap({
    active: isOpen && isMobile,
    focusFirstOnMount: true,
    returnFocusOnDeactivate: true,
  });

  // Gesture handling for mobile menu
  const { createGestureHandlers } = useGestures({
    onSwipeLeft: () => {
      if (isOpen && isMobile) {
        setIsOpen(false);
      }
    },
    onSwipeRight: () => {
      if (!isOpen && isMobile) {
        setIsOpen(true);
      }
    },
    swipeThreshold: 50,
  });

  // Handle scroll detection for sticky header
  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  // Close mobile menu on escape or outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        navRef.current &&
        !navRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      
      // Prevent body scroll when mobile menu is open
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  // Close mobile menu on viewport change
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  // Handle item click
  const handleItemClick = useCallback((item: NavigationItem) => {
    if (item.disabled) return;
    
    onItemClick?.(item);
    
    if (item.onClick) {
      item.onClick();
    }
    
    // Close mobile menu after click
    if (isMobile && !item.children) {
      setIsOpen(false);
    }
  }, [onItemClick, isMobile]);

  // Handle dropdown toggle
  const handleDropdownToggle = useCallback((itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  }, [activeDropdown]);

  // Render navigation item
  const renderNavItem = useCallback((item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownOpen = activeDropdown === item.id;
    
    const itemContent = (
      <div className="nav-item-content">
        {item.icon && <span className="nav-item-icon">{item.icon}</span>}
        <span className="nav-item-label">{item.label}</span>
        {hasChildren && (
          <ChevronDown
            className={`nav-item-chevron ${isDropdownOpen ? 'nav-item-chevron--open' : ''}`}
            size={16}
          />
        )}
      </div>
    );

    if (item.href && !hasChildren) {
      return (
        <a
          key={item.id}
          href={item.href}
          className={`nav-item nav-item--level-${level} ${item.disabled ? 'nav-item--disabled' : ''}`}
          onClick={() => handleItemClick(item)}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
        >
          {itemContent}
        </a>
      );
    }

    return (
      <div key={item.id} className={`nav-item-wrapper nav-item-wrapper--level-${level}`}>
        <button
          className={`nav-item nav-item--level-${level} ${item.disabled ? 'nav-item--disabled' : ''}`}
          onClick={() => {
            if (hasChildren) {
              handleDropdownToggle(item.id);
            } else {
              handleItemClick(item);
            }
          }}
          aria-expanded={hasChildren ? isDropdownOpen : undefined}
          disabled={item.disabled}
        >
          {itemContent}
        </button>
        
        {hasChildren && (
          <AnimatePresence>
            {(isDropdownOpen || !isMobile) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`nav-dropdown nav-dropdown--level-${level}`}
              >
                {item.children!.map((child) => renderNavItem(child, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  }, [activeDropdown, handleItemClick, handleDropdownToggle, isMobile]);

  // Mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Navigation styles
  const navClasses = [
    'responsive-nav',
    `responsive-nav--${variant}`,
    className,
    {
      'responsive-nav--mobile': isMobile,
      'responsive-nav--tablet': isTablet,
      'responsive-nav--desktop': isDesktop,
      'responsive-nav--scrolled': scrolled,
      'responsive-nav--transparent': transparent && !scrolled,
      'responsive-nav--border': showBorder,
      'responsive-nav--sticky': sticky,
    },
  ].filter(Boolean).join(' ');

  if (variant === 'bottom' && isMobile) {
    return (
      <nav className={navClasses} ref={navRef}>
        <div className="responsive-nav__bottom-items">
          {items.slice(0, 5).map((item) => (
            <button
              key={item.id}
              className={`responsive-nav__bottom-item ${item.disabled ? 'responsive-nav__bottom-item--disabled' : ''}`}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              aria-label={item.label}
            >
              {item.icon && <span className="responsive-nav__bottom-icon">{item.icon}</span>}
              <span className="responsive-nav__bottom-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={navClasses} ref={navRef}>
        <div className="responsive-nav__container">
          {/* Logo */}
          {logo && (
            <div className="responsive-nav__logo">
              {logo}
            </div>
          )}

          {/* Desktop Navigation */}
          {isDesktop && (
            <div className="responsive-nav__desktop">
              {items.map((item) => renderNavItem(item))}
            </div>
          )}

          {/* Mobile Menu Button */}
          {(isMobile || isTablet) && (
            <button
              className="responsive-nav__toggle"
              onClick={toggleMobileMenu}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (isMobile || isTablet) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="responsive-nav__backdrop"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              ref={(node) => {
                mobileMenuRef.current = node;
                focusTrapRef.current = node;
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="responsive-nav__mobile-menu"
              {...createGestureHandlers()}
            >
              <div className="responsive-nav__mobile-content">
                {/* Mobile Logo */}
                {logo && (
                  <div className="responsive-nav__mobile-logo">
                    {logo}
                  </div>
                )}

                {/* Mobile Navigation Items */}
                <div className="responsive-nav__mobile-items">
                  {items.map((item) => renderNavItem(item))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .responsive-nav {
          position: ${sticky ? 'sticky' : 'relative'};
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: ${transparent ? 'transparent' : 'rgba(255, 255, 255, 0.95)'};
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .responsive-nav--scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .responsive-nav--border {
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .responsive-nav--bottom {
          position: fixed;
          bottom: 0;
          top: auto;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          padding: env(safe-area-inset-bottom) 0 0 0;
        }

        .responsive-nav__container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }

        .responsive-nav__logo {
          flex-shrink: 0;
        }

        .responsive-nav__desktop {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          color: inherit;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
        }

        .nav-item:hover:not(.nav-item--disabled) {
          background: rgba(0, 0, 0, 0.05);
        }

        .nav-item--disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-item-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-item-chevron {
          transition: transform 0.2s ease;
        }

        .nav-item-chevron--open {
          transform: rotate(180deg);
        }

        .responsive-nav__toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .responsive-nav__toggle:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .responsive-nav__backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 200;
        }

        .responsive-nav__mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(320px, 80vw);
          background: white;
          z-index: 300;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
          padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0;
        }

        .responsive-nav__mobile-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .responsive-nav__mobile-logo {
          padding: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .responsive-nav__mobile-items {
          flex: 1;
          padding: 1rem 0;
        }

        .responsive-nav__mobile-items .nav-item {
          width: 100%;
          justify-content: flex-start;
          border-radius: 0;
          padding: 1rem 1.5rem;
        }

        .responsive-nav__bottom-items {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0.75rem 0;
          max-width: 100%;
        }

        .responsive-nav__bottom-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
          min-width: 0;
          flex: 1;
        }

        .responsive-nav__bottom-icon {
          flex-shrink: 0;
        }

        .responsive-nav__bottom-label {
          font-size: 0.75rem;
          text-align: center;
          word-break: break-word;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
          .responsive-nav__container {
            height: 56px;
            padding: 0 1rem;
          }
        }
      `}</style>
    </>
  );
};