"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

/*
  ONE transition grammar for the whole site: no hard cuts.

  Leaving  — the current page lifts up (~28px) and fades over 380ms,
             THEN the route changes.
  Arriving — the new page's content rises in via <PageEnter> (each page wraps
             its content once).

  Works cards keep plain <Link>: their overlay has its own shared-element
  morph and must not trigger the page exit.

  Reduced motion: navigation is instant, entrances render in place.
*/

const Ctx = createContext<{ navigate: (href: string) => void }>({ navigate: () => {} });

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const dest = useRef<string | null>(null);

  const navigate = (href: string) => {
    if (href === pathname) return;
    if (reduce) return router.push(href);
    dest.current = href;
    setLeaving(true);
  };

  // arrival: snap the wrapper back instantly; the page's own PageEnter animates
  useEffect(() => {
    setLeaving(false);
    dest.current = null;
  }, [pathname]);

  return (
    <Ctx.Provider value={{ navigate }}>
      <motion.div
        animate={leaving ? { opacity: 0, y: -28 } : { opacity: 1, y: 0 }}
        transition={leaving ? { duration: 0.38, ease: [0.7, 0, 0.3, 1] } : { duration: 0 }}
        onAnimationComplete={() => {
          if (leaving && dest.current) router.push(dest.current);
        }}
      >
        {children}
      </motion.div>
    </Ctx.Provider>
  );
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
      initial={reduce ? false : { opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
