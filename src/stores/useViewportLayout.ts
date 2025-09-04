// src/stores/useViewportLayout.ts
import { create } from 'zustand';

export type Layout = '1x1' | '2x2';

type State = {
  layout: Layout;
  activeViewportId: string | null;
  setLayout: (layout: Layout) => void;
  setActiveViewport: (id: string) => void;
};

export const useViewportLayout = create<State>((set) => ({
  layout: '1x1',
  activeViewportId: 'STACK-1',
  setLayout: (layout) => set({ layout }),
  setActiveViewport: (id) => set({ activeViewportId: id }),
}));
