"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

/*
  ONE transition grammar for the whole site: no hard cuts.

  Leaving  - the current page fades over 300ms, THEN the route changes.
  Arriving - the new page's content fades in via <PageEnter> (each page
             wraps its content once).
  Both used to travel vertically too (lift 28px out, rise 26px in); that
  read as the header "animating up" on every nav click, so the motion is
  now opacity only (Margaret, 2026-10-08).

  Split in two so the nav pill can live OUTSIDE the lifting page:
    TransitionProvider - the context (navigate + the pending destination)
    PageFrame          - the motion wrapper that actually lifts the page
  The nav reads `pending` to start its own slide the moment a link is
  clicked, in step with the page's exit rather than after it.

  Works cards keep plain <Link>: their overlay has its own shared-element
  morph and must not trigger the page exit.

  Reduced motion: navigation is instant, entrances render in place.

  Every page starts at the top: the window is scrolled to 0 right before
  the route changes (the old page has already faded out, so the jump is
  invisible). Without it, leaving About or Works from the footer carried
  the scroll position over and the next page opened at its footer
  (Margaret, 2026-10-08). The works overlay doesn't go through navigate(),
  so the home column under it is untouched.
*/

type Transition = {
  navigate: (href: string) => void;
  pending: string | null;   // destination while the exit plays
  leaving: boolean;
  onLeft: () => void;       // PageFrame reports the exit finished
};

const Ctx = createContext<Transition>({ navigate: () => {}, pending: null, leaving: false, onLeft: () => {} });

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [pending, setPending] = useState<string | null>(null);
  const dest = useRef<string | null>(null);

  const navigate = (href: string) => {
    if (href === pathname) return;
    if (reduce) {
      window.scrollTo(0, 0);
      return router.push(href);
    }
    dest.current = href;
    setPending(href);
  };

  // arrival: clear the exit state; the page's own PageEnter animates in
  useEffect(() => {
    setPending(null);
    dest.current = null;
  }, [pathname]);

  const onLeft = () => {
    if (!dest.current) return;
    window.scrollTo(0, 0);
    router.push(dest.current);
  };

  return <Ctx.Provider value={{ navigate, pending, leaving: pending !== null, onLeft }}>{children}</Ctx.Provider>;
}

/* The lifting wrapper - wraps the routed page once, in the root layout. */
export function PageFrame({ children }: { children: React.ReactNode }) {
  const { leaving, onLeft } = useContext(Ctx);
  return (
    <motion.div
      animate={leaving ? { opacity: 0 } : { opacity: 1 }}
      transition={leaving ? { duration: 0.3, ease: "easeOut" } : { duration: 0 }}
      onAnimationComplete={() => leaving && onLeft()}
    >
      {children}
    </motion.div>
  );
}

/* Where the site is headed while the exit plays; null when settled. */
export function usePendingRoute() {
  return useContext(Ctx).pending;
}

/* Internal link that plays the exit before routing. Prefetches like next/link. */
export function TransitionLink({
  href,
  children,
  className,
  ...rest
}: React.ComponentProps<typeof Link> & { href: string }) {
  const { navigate } = useContext(Ctx);
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let new-tab shortcuts through
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* Entrance wrapper for page content. */
export function PageEnter({ children, className, delay = 0.05 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
