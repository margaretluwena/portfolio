"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/*
  Shared state for the persistent nav pill (mounted once in the root layout).
  Only the home page writes here: it owns the intro (nav hidden until the
  wordmark lands) and the live "1/6 - SELECTED WORKS" counter. `home` stays
  true while the home page is mounted - including under the works overlay,
  whose pathname is /works/[slug] - so the nav never flips to subpage mode
  beneath the intercepting route. Subpages derive their label from the
  pathname inside Nav itself and never touch this.
*/

type NavState = {
  home: boolean;              // home page mounted
  hidden: boolean;            // intro playing - pill fully transparent, no pointer events
  counter: React.ReactNode;   // right slot on home
};

const initial: NavState = { home: false, hidden: false, counter: null };

const Ctx = createContext<{ nav: NavState; setNav: (patch: Partial<NavState>) => void }>({
  nav: initial,
  setNav: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [nav, set] = useState<NavState>(initial);
  const setNav = useCallback((patch: Partial<NavState>) => set((s) => ({ ...s, ...patch })), []);
  const value = useMemo(() => ({ nav, setNav }), [nav, setNav]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useNav = () => useContext(Ctx);
