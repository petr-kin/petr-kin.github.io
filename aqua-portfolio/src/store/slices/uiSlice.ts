import { StateCreator } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  timeout?: NodeJS.Timeout;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  persistent?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  tasks?: string[];
}

export interface UIState {
  loading: LoadingState;
  modal: {
    activeModal: Modal | null;
    modalStack: Modal[];
  };
  toasts: Toast[];
  sidebarCollapsed: boolean;
  preferredLayout: 'grid' | 'list' | 'masonry';
  viewport: {
    width: number;
    height: number;
    breakpoint: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
  scrollPosition: {
    x: number;
    y: number;
  };
  lastInteraction: number;
  isIdle: boolean;
}

export interface UIActions {
  // Loading
  setLoading: (loading: boolean | Partial<LoadingState>) => void;
  setLoadingProgress: (progress: number) => void;
  setLoadingMessage: (message: string) => void;
  addLoadingTask: (task: string) => void;
  removeLoadingTask: (task: string) => void;

  // Modals
  setModal: (modal: Modal | null) => void;
  openModal: (component: string, props?: Record<string, any>, options?: Partial<Omit<Modal, 'id' | 'component' | 'props'>>) => void;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;

  // Toasts
  setToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;

  // Layout
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setPreferredLayout: (layout: UIState['preferredLayout']) => void;

  // Viewport
  setViewport: (viewport: Partial<UIState['viewport']>) => void;
  setScrollPosition: (position: { x: number; y: number }) => void;

  // Interaction
  updateLastInteraction: () => void;
  setIdle: (idle: boolean) => void;

  // Utilities
  resetUI: () => void;
}

export type UISlice = {
  ui: UIState;
} & UIActions;

const initialUIState: UIState = {
  loading: {
    isLoading: false,
    message: undefined,
    progress: undefined,
    tasks: [],
  },
  modal: {
    activeModal: null,
    modalStack: [],
  },
  toasts: [],
  sidebarCollapsed: false,
  preferredLayout: 'grid',
  viewport: {
    width: 0,
    height: 0,
    breakpoint: 'md',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  },
  scrollPosition: {
    x: 0,
    y: 0,
  },
  lastInteraction: Date.now(),
  isIdle: false,
};

export const createUISlice: StateCreator<UISlice, [["zustand/immer", never]], [], UISlice> = (set, get) => ({
  ui: initialUIState,

  // Loading actions
  setLoading: (loading) =>
    set((state) => {
      if (typeof loading === 'boolean') {
        state.ui.loading.isLoading = loading;
        if (!loading) {
          state.ui.loading.message = undefined;
          state.ui.loading.progress = undefined;
        }
      } else {
        Object.assign(state.ui.loading, loading);
      }
    }),

  setLoadingProgress: (progress) =>
    set((state) => {
      state.ui.loading.progress = Math.max(0, Math.min(100, progress));
    }),

  setLoadingMessage: (message) =>
    set((state) => {
      state.ui.loading.message = message;
    }),

  addLoadingTask: (task) =>
    set((state) => {
      if (!state.ui.loading.tasks?.includes(task)) {
        state.ui.loading.tasks = state.ui.loading.tasks ? [...state.ui.loading.tasks, task] : [task];
      }
    }),

  removeLoadingTask: (task) =>
    set((state) => {
      state.ui.loading.tasks = state.ui.loading.tasks?.filter(t => t !== task) || [];
    }),

  // Modal actions
  setModal: (modal) =>
    set((state) => {
      if (modal) {
        state.ui.modal.activeModal = modal;
        if (!state.ui.modal.modalStack.find(m => m.id === modal.id)) {
          state.ui.modal.modalStack.push(modal);
        }
      } else {
        state.ui.modal.activeModal = null;
        state.ui.modal.modalStack = [];
      }
    }),

  openModal: (component, props, options) =>
    set((state) => {
      const modal: Modal = {
        id: `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        component,
        props,
        size: 'md',
        closable: true,
        persistent: false,
        ...options,
      };
      
      state.ui.modal.activeModal = modal;
      state.ui.modal.modalStack.push(modal);
    }),

  closeModal: (id) =>
    set((state) => {
      if (id) {
        // Close specific modal
        state.ui.modal.modalStack = state.ui.modal.modalStack.filter(m => m.id !== id);
        if (state.ui.modal.activeModal?.id === id) {
          state.ui.modal.activeModal = state.ui.modal.modalStack[state.ui.modal.modalStack.length - 1] || null;
        }
      } else {
        // Close current modal
        if (state.ui.modal.modalStack.length > 0) {
          state.ui.modal.modalStack.pop();
          state.ui.modal.activeModal = state.ui.modal.modalStack[state.ui.modal.modalStack.length - 1] || null;
        }
      }
    }),

  closeAllModals: () =>
    set((state) => {
      // Clear all timeouts for toasts before clearing the stack
      state.ui.modal.modalStack.forEach(modal => {
        // Clean up any modal-specific resources
      });
      
      state.ui.modal.activeModal = null;
      state.ui.modal.modalStack = [];
    }),

  // Toast actions
  setToast: (toastData) =>
    set((state) => {
      const toast: Toast = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        duration: 5000,
        dismissible: true,
        ...toastData,
      };

      // Set timeout for auto-dismiss
      if (toast.duration && toast.duration > 0) {
        toast.timeout = setTimeout(() => {
          get().removeToast(toast.id);
        }, toast.duration);
      }

      state.ui.toasts.push(toast);

      // Limit number of toasts
      if (state.ui.toasts.length > 5) {
        const oldToast = state.ui.toasts.shift();
        if (oldToast?.timeout) {
          clearTimeout(oldToast.timeout);
        }
      }
    }),

  removeToast: (id) =>
    set((state) => {
      const toastIndex = state.ui.toasts.findIndex(t => t.id === id);
      if (toastIndex !== -1) {
        const toast = state.ui.toasts[toastIndex];
        if (toast.timeout) {
          clearTimeout(toast.timeout);
        }
        state.ui.toasts.splice(toastIndex, 1);
      }
    }),

  clearAllToasts: () =>
    set((state) => {
      state.ui.toasts.forEach(toast => {
        if (toast.timeout) {
          clearTimeout(toast.timeout);
        }
      });
      state.ui.toasts = [];
    }),

  // Layout actions
  setSidebarCollapsed: (collapsed) =>
    set((state) => {
      state.ui.sidebarCollapsed = collapsed;
    }),

  toggleSidebar: () =>
    set((state) => {
      state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
    }),

  setPreferredLayout: (layout) =>
    set((state) => {
      state.ui.preferredLayout = layout;
    }),

  // Viewport actions
  setViewport: (viewport) =>
    set((state) => {
      Object.assign(state.ui.viewport, viewport);
    }),

  setScrollPosition: (position) =>
    set((state) => {
      state.ui.scrollPosition = position;
    }),

  // Interaction actions
  updateLastInteraction: () =>
    set((state) => {
      state.ui.lastInteraction = Date.now();
      if (state.ui.isIdle) {
        state.ui.isIdle = false;
      }
    }),

  setIdle: (idle) =>
    set((state) => {
      state.ui.isIdle = idle;
    }),

  // Utilities
  resetUI: () =>
    set((state) => {
      // Clear all timeouts
      state.ui.toasts.forEach(toast => {
        if (toast.timeout) {
          clearTimeout(toast.timeout);
        }
      });

      // Reset to initial state but preserve some user preferences
      const preservedState = {
        sidebarCollapsed: state.ui.sidebarCollapsed,
        preferredLayout: state.ui.preferredLayout,
      };

      state.ui = { ...initialUIState, ...preservedState };
    }),
});