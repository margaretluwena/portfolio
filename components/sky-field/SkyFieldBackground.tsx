'use client';

import { useEffect, useRef } from 'react';
import { createSkyField, type SkyFieldOptions } from './sky-field';

type Props = SkyFieldOptions & {
  /**
   * Name of a CSS variable that holds the font family, e.g. the `variable`
   * from next/font. Canvas can't read CSS variables, so we resolve it here.
   */
  fontVar?: string;
};

/**
 * Full-screen animated ASCII sky that sits behind all page content.
 * Render it once, e.g. in app/layout.tsx, as the first child of <body>.
 */
export default function SkyFieldBackground({ fontVar = '--font-sky', ...options }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fromVar = getComputedStyle(document.body).getPropertyValue(fontVar).trim();
    const field = createSkyField(canvas, {
      ...options,
      ...(fromVar ? { fontFamily: `${fromVar}, ui-monospace, Menlo, monospace` } : {}),
    });
    return () => field.destroy();
    // the scene is built once; use field.set() if you need live changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
