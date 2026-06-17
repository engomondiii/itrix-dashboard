import { create } from "zustand";

interface LeadSelectionState {
  selected: Set<string>;
  toggle: (id: string) => void;
  setMany: (ids: string[], on: boolean) => void;
  clear: () => void;
}

/** Row selection for bulk actions on the leads table. */
export const useLeadStore = create<LeadSelectionState>((set) => ({
  selected: new Set<string>(),
  toggle: (id) =>
    set((s) => {
      const next = new Set(s.selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selected: next };
    }),
  setMany: (ids, on) =>
    set((s) => {
      const next = new Set(s.selected);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return { selected: next };
    }),
  clear: () => set({ selected: new Set<string>() }),
}));
