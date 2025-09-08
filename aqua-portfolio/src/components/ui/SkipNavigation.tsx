'use client';

import React from 'react';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipNavigationProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' },
];

export const SkipNavigation = ({ 
  links = defaultLinks, 
  className = '' 
}: SkipNavigationProps) => {
  return (
    <nav 
      className={`skip-navigation ${className}`}
      aria-label="Skip navigation links"
    >
      <ul className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-[9999] bg-white border border-gray-300 shadow-lg rounded-br-lg">
        {links.map((link, index) => (
          <li key={link.href} className="list-none">
            <a
              href={link.href}
              className={`
                block px-4 py-2 text-sm font-medium text-gray-900 
                hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                ${index === 0 ? 'rounded-tr-lg' : ''}
                ${index === links.length - 1 ? 'rounded-br-lg' : ''}
              `}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const target = document.querySelector(link.href);
                  if (target) {
                    (target as HTMLElement).focus({ preventScroll: false });
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// Hook to manage skip navigation targets
export const useSkipNavigation = () => {
  const createSkipTarget = (id: string, label?: string) => ({
    id,
    tabIndex: -1,
    'aria-label': label || `${id.replace('-', ' ')} section`,
  });

  return {
    createSkipTarget,
  };
};