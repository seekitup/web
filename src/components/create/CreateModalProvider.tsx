import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  CreateModalContext,
  type CreateMode,
  type CreateModalApi,
  type CreateModalState,
  type CreateTab,
  type OpenOptions,
} from "./createModalContext";

export type { CreateMode, CreateTab } from "./createModalContext";

const DEFAULT_STATE: CreateModalState = {
  isOpen: false,
  mode: "creating",
  tab: "collection",
  sharedUrl: null,
  preselectedCollectionId: null,
};

export function CreateModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreateModalState>(DEFAULT_STATE);
  const location = useLocation();
  const lastPathRef = useRef(location.pathname);

  const open = useCallback((opts: OpenOptions = {}) => {
    setState({
      isOpen: true,
      mode: opts.mode ?? "creating",
      tab: opts.tab ?? "collection",
      sharedUrl: opts.sharedUrl ?? null,
      preselectedCollectionId: opts.preselectedCollectionId ?? null,
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setMode = useCallback((mode: CreateMode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const setTab = useCallback((tab: CreateTab) => {
    setState((prev) => ({ ...prev, tab }));
  }, []);

  // Close the modal when the user navigates between routes — avoids stale state.
  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      lastPathRef.current = location.pathname;
      setState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
    }
  }, [location.pathname]);

  const api = useMemo<CreateModalApi>(
    () => ({ ...state, open, close, setMode, setTab }),
    [state, open, close, setMode, setTab],
  );

  return (
    <CreateModalContext.Provider value={api}>
      {children}
    </CreateModalContext.Provider>
  );
}
