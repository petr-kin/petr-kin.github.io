import { StateCreator } from 'zustand';

export interface Breadcrumb {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  isActive?: boolean;
}

export interface RecentPage {
  id: string;
  title: string;
  href: string;
  timestamp: number;
  category?: string;
  favicon?: string;
}

export interface NavigationState {
  activeSection: string | null;
  previousSection: string | null;
  breadcrumbs: Breadcrumb[];
  mobileMenuOpen: boolean;
  recentPages: RecentPage[];
  navigationHistory: string[];
  backButtonEnabled: boolean;
  forwardButtonEnabled: boolean;
  searchQuery: string;
  searchResults: any[];
  isSearching: boolean;
}

export interface NavigationActions {
  setActiveSection: (section: string | null) => void;
  addBreadcrumb: (breadcrumb: Omit<Breadcrumb, 'id'>) => void;
  removeBreadcrumb: (id: string) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  clearBreadcrumbs: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  addRecentPage: (page: Omit<RecentPage, 'id' | 'timestamp'>) => void;
  removeRecentPage: (id: string) => void;
  clearRecentPages: () => void;
  navigateBack: () => void;
  navigateForward: () => void;
  updateNavigationHistory: (path: string) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any[]) => void;
  setIsSearching: (searching: boolean) => void;
  clearSearch: () => void;
}

export type NavigationSlice = {
  navigation: NavigationState;
} & NavigationActions;

const initialNavigationState: NavigationState = {
  activeSection: null,
  previousSection: null,
  breadcrumbs: [],
  mobileMenuOpen: false,
  recentPages: [],
  navigationHistory: [],
  backButtonEnabled: false,
  forwardButtonEnabled: false,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
};

export const createNavigationSlice: StateCreator<NavigationSlice, [['zustand/immer', never]], [], NavigationSlice> = (set, get) => ({
  navigation: initialNavigationState,

  setActiveSection: (section) =>
    set((state) => {
      if (state.navigation.activeSection !== section) {
        state.navigation.previousSection = state.navigation.activeSection;
        state.navigation.activeSection = section;
      }
    }),

  addBreadcrumb: (breadcrumbData) =>
    set((state) => {
      const breadcrumb: Breadcrumb = {
        id: `breadcrumb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...breadcrumbData,
      };
      
      // Mark previous breadcrumbs as inactive
      state.navigation.breadcrumbs.forEach(bc => {
        bc.isActive = false;
      });
      
      // Add new breadcrumb as active
      breadcrumb.isActive = true;
      state.navigation.breadcrumbs.push(breadcrumb);
      
      // Limit breadcrumbs to prevent UI overflow
      if (state.navigation.breadcrumbs.length > 10) {
        state.navigation.breadcrumbs = state.navigation.breadcrumbs.slice(-10);
      }
    }),

  removeBreadcrumb: (id) =>
    set((state) => {
      const index = state.navigation.breadcrumbs.findIndex(bc => bc.id === id);
      if (index !== -1) {
        state.navigation.breadcrumbs.splice(index, 1);
        
        // If we removed the active breadcrumb, make the last one active
        if (state.navigation.breadcrumbs.length > 0) {
          const hasActive = state.navigation.breadcrumbs.some(bc => bc.isActive);
          if (!hasActive) {
            state.navigation.breadcrumbs[state.navigation.breadcrumbs.length - 1].isActive = true;
          }
        }
      }
    }),

  setBreadcrumbs: (breadcrumbs) =>
    set((state) => {
      state.navigation.breadcrumbs = breadcrumbs.map((bc, index) => ({
        ...bc,
        isActive: index === breadcrumbs.length - 1,
      }));
    }),

  clearBreadcrumbs: () =>
    set((state) => {
      state.navigation.breadcrumbs = [];
    }),

  setMobileMenuOpen: (open) =>
    set((state) => {
      state.navigation.mobileMenuOpen = open;
      
      // Prevent body scroll when menu is open
      if (typeof window !== 'undefined') {
        document.body.style.overflow = open ? 'hidden' : '';
      }
    }),

  toggleMobileMenu: () =>
    set((state) => {
      const newOpen = !state.navigation.mobileMenuOpen;
      get().setMobileMenuOpen(newOpen);
    }),

  addRecentPage: (pageData) =>
    set((state) => {
      const page: RecentPage = {
        id: `recent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...pageData,
      };
      
      // Remove if already exists
      state.navigation.recentPages = state.navigation.recentPages.filter(
        p => p.href !== page.href
      );
      
      // Add to beginning
      state.navigation.recentPages.unshift(page);
      
      // Limit to 20 recent pages
      if (state.navigation.recentPages.length > 20) {
        state.navigation.recentPages = state.navigation.recentPages.slice(0, 20);
      }
    }),

  removeRecentPage: (id) =>
    set((state) => {
      state.navigation.recentPages = state.navigation.recentPages.filter(p => p.id !== id);
    }),

  clearRecentPages: () =>
    set((state) => {
      state.navigation.recentPages = [];
    }),

  navigateBack: () =>
    set((state) => {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        state.navigation.backButtonEnabled = window.history.length > 1;
      }
    }),

  navigateForward: () =>
    set((state) => {
      if (typeof window !== 'undefined') {
        window.history.forward();
      }
    }),

  updateNavigationHistory: (path) =>
    set((state) => {
      // Add to history
      if (state.navigation.navigationHistory[state.navigation.navigationHistory.length - 1] !== path) {
        state.navigation.navigationHistory.push(path);
        
        // Limit history size
        if (state.navigation.navigationHistory.length > 50) {
          state.navigation.navigationHistory = state.navigation.navigationHistory.slice(-50);
        }
      }
      
      // Update button states
      state.navigation.backButtonEnabled = state.navigation.navigationHistory.length > 1;
    }),

  setSearchQuery: (query) =>
    set((state) => {
      state.navigation.searchQuery = query;
      
      // Auto-clear results when query is cleared
      if (!query.trim()) {
        state.navigation.searchResults = [];
        state.navigation.isSearching = false;
      }
    }),

  setSearchResults: (results) =>
    set((state) => {
      state.navigation.searchResults = results;
      state.navigation.isSearching = false;
    }),

  setIsSearching: (searching) =>
    set((state) => {
      state.navigation.isSearching = searching;
    }),

  clearSearch: () =>
    set((state) => {
      state.navigation.searchQuery = '';
      state.navigation.searchResults = [];
      state.navigation.isSearching = false;
    }),
});