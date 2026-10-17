import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type DemoModeContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: PropsWithChildren) {
  const [enabled, setEnabled] = useState(__DEV__);
  const value = useMemo(() => ({ enabled, setEnabled }), [enabled]);
  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) throw new Error('useDemoMode must be used within DemoModeProvider.');
  return context;
}
