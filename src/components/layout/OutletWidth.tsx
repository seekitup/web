import { useEffect, useState, type ReactNode } from "react";
import {
  OutletWidthContext,
  useOutletWidthContext,
  type OutletWidth,
} from "@/hooks/outletWidthContext";

export function OutletWidthProvider({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState<OutletWidth>("narrow");
  return (
    <OutletWidthContext.Provider value={{ width, setWidth }}>
      {children}
    </OutletWidthContext.Provider>
  );
}

/**
 * Pages render this once to declare their preferred outlet width. Width resets
 * to "narrow" on unmount so other routes are unaffected.
 */
export function SetOutletWidth({ value }: { value: OutletWidth }) {
  const { setWidth } = useOutletWidthContext();
  useEffect(() => {
    setWidth(value);
    return () => setWidth("narrow");
  }, [value, setWidth]);
  return null;
}
