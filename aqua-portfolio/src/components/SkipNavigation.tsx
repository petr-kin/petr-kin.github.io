'use client';

import React from 'react';

interface SkipNavItem {
  href: string;
  label: string;
}

interface SkipNavigationProps {
  links?: SkipNavItem[];
  className?: string;
}

const defaultLinks: SkipNavItem[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' },
];

/**
 * Skip navigation links for better accessibility
 * Allows keyboard users to quickly navigate to main page sections
 */
export const SkipNavigation: React.FC<SkipNavigationProps> = ({
  links = defaultLinks,
  className = '',
}) => {
  return (
    <nav 
      aria-label="Skip navigation"
      className={`skip-navigation ${className}`}
    >
      <ul className="skip-nav-list">
        {links.map((link, index) => (
          <li key={index}>
            <a 
              href={link.href}
              className="skip-nav-link"
              onKeyDown={(e) => {
                // Ensure skip links work with keyboard navigation
                if (e.key === 'Enter') {
                  const target = document.querySelector(link.href);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Focus the target element if it's focusable
                    if (target instanceof HTMLElement && target.tabIndex >= 0) {
                      target.focus();
                    }
                  }
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SkipNavigation;