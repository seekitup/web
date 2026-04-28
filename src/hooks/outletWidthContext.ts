import { createContext, useContext } from "react";

export type OutletWidth = "narrow" | "wide" | "full";

export interface OutletWidthContextValue {
  width: OutletWidth;
  setWidth: (next: OutletWidth) => void;
}

export const OutletWidthContext = createContext<OutletWidthContextValue | null>(
  null,
);

export function useOutletWidthContext(): OutletWidthContextValue {
  const ctx = useContext(OutletWidthContext);
  if (!ctx) {
    throw new Error(
      "useOutletWidth must be used within an OutletWidthProvider",
    );
  }
  return ctx;
}

export function useOutletWidth(): OutletWidth {
  return useOutletWidthContext().width;
}
