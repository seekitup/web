import { createContext, useContext } from "react";

export type CreateMode = "creating" | "organizing";
export type CreateTab = "collection" | "link";

export interface CreateModalState {
  isOpen: boolean;
  mode: CreateMode;
  tab: CreateTab;
  sharedUrl: string | null;
  preselectedCollectionId: number | null;
}

export interface OpenOptions {
  mode?: CreateMode;
  tab?: CreateTab;
  sharedUrl?: string | null;
  preselectedCollectionId?: number | null;
}

export interface CreateModalApi extends CreateModalState {
  open: (opts?: OpenOptions) => void;
  close: () => void;
  setMode: (mode: CreateMode) => void;
  setTab: (tab: CreateTab) => void;
}

export const CreateModalContext = createContext<CreateModalApi | null>(null);

export function useCreateModal(): CreateModalApi {
  const ctx = useContext(CreateModalContext);
  if (!ctx) {
    throw new Error(
      "useCreateModal must be used within a <CreateModalProvider>",
    );
  }
  return ctx;
}
