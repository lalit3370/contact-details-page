import { createContext, useMemo, useState } from 'react';

export const LayoutOverrideContext = createContext({
  override: null,
  setOverride: () => {},
  clearOverride: () => {},
});

export function LayoutOverrideProvider({ children }) {
  const [override, setOverride] = useState(null);

  const value = useMemo(
    () => ({
      override,
      setOverride,
      clearOverride: () => setOverride(null),
    }),
    [override],
  );

  return <LayoutOverrideContext.Provider value={value}>{children}</LayoutOverrideContext.Provider>;
}
