import { create } from 'zustand';

type ViewMode = 'map' | 'list';

interface UiStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  viewMode: 'map',
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleViewMode: () =>
    set((state) => ({ viewMode: state.viewMode === 'map' ? 'list' : 'map' })),
}));
