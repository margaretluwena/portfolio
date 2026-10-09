export interface SkyFieldColors {
  background: string;
  sky: string;
  skyDense: string;
  cloudShade: string;
  cloudShadeDeep: string;
  farRidge: string;
  farTexture: string;
  domeRidge: string;
  domeShadow: string;
  domeLit: string;
  frontRidge: string;
  grass: string;
  ground: string;
  /** Four petal colours */
  petals: string[];
  flowerCenter: string;
  poodle: string;
  poodleFace: string;
  poodleLegs: string;
  ballRim: string;
  ballSeam: string;
  hint: string;
}

export interface SkyFieldOptions {
  /** Font size of one ASCII cell in px. Smaller means more detail. Default 9 */
  cellSize?: number;
  /** Cloud drift and flower sway speed. Default 1 */
  wind?: number;
  /** 0 to 1. Default 0.55 */
  cover?: number;
  /** How far down the sky gradient reaches, 0.3 to 1.3. Default 0.85 */
  depth?: number;
  /** Flower density, 0 to 2. Default 1 */
  flowers?: number;
  /** Height of the hills, 0.1 to 1.5 - 0.5 is half as tall. Default 1 */
  hills?: number;
  /** How much the hills roll, 0 (flat lines) to 3, independent of `hills`. Default 1 */
  bumps?: number;
  /** Dither and specks inside the hills, 0 (bare) to 1.5. Default 1 */
  hillTexture?: number;
  /**
   * Called on every real throw. Return this visitor's player number (or a
   * promise of it) - "you're the Nth person who's played with me"; the dog
   * says it on the first catch of the visit.
   */
  onThrow?: () => number | Promise<number>;
  /** The same number without claiming a new one (the idle line). */
  onCount?: () => number | Promise<number>;
  /** Characters used for the sky. Default "dither" */
  ramp?: 'dither' | 'ascii' | 'stars' | 'binary';
  /** Fix the landscape instead of a random one on each load */
  seed?: number;
  /** Tennis ball and poodle fetch game. Default true */
  game?: boolean;
  /** Text above the ball before anyone finds it. Empty string hides it. Default "shake me" */
  hint?: string;
  /** Where the ball waits, as a fraction of the width. Default 0.62 */
  ballX?: number;
  /** Default 30 */
  maxFps?: number;
  /** A concrete font-family list (canvas cannot read CSS variables) */
  fontFamily?: string;
  colors?: Partial<SkyFieldColors>;
}

export interface SkyField {
  set(next: SkyFieldOptions & { seed?: number }): void;
  destroy(): void;
}

export function createSkyField(canvas: HTMLCanvasElement, options?: SkyFieldOptions): SkyField;
