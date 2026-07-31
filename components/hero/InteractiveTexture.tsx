"use client";

/*
  THE SIGNATURE GRAPHIC - the real Figma texture (assets/hero-texture.png,
  exported from node 116:73), liquid-displaced around the cursor.

  One fullscreen quad, one texture read. The vertex shader bypasses the camera
  entirely (gl_Position = position), so no ortho/zoom sizing traps.

  Mapping: cover-fit, anchored to the BOTTOM of the image. The PNG's baked
  white fade lives at its bottom edge, and the Figma main page shows exactly
  that bottom slice in the top band - so during the 100vh → 36vh collapse the
  fade stays glued to the band's bottom and the page always melts into white.

  Interaction: eased cursor uniform; pixels near the cursor get a swirl + push
  displacement and a faint sheen. Idle: a slow breathing warp.
  prefers-reduced-motion → static frame (uMotion = 0, no render loop).
  Off-screen → render loop pauses.
*/

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect, Suspense } from "react";
import { useInView, useReducedMotion } from "motion/react";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2  uRes;      // canvas px
  uniform vec2  uTexRes;   // texture px
  uniform float uTime;
  uniform vec2  uMouse;    // 0..1, y up, eased
  uniform float uMotion;   // 0 = static, 1 = animated
  varying vec2  vUv;

  vec2 hash(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453)*2.0-1.0; }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(dot(hash(i+vec2(0,0)),f-vec2(0,0)), dot(hash(i+vec2(1,0)),f-vec2(1,0)), u.x),
               mix(dot(hash(i+vec2(0,1)),f-vec2(0,1)), dot(hash(i+vec2(1,1)),f-vec2(1,1)), u.x), u.y);
  }

  // cover-fit, anchored bottom (image y=0) and centered horizontally
  vec2 coverUv(vec2 uv){
    float ca = uRes.x / uRes.y;
    float ta = uTexRes.x / uTexRes.y;
    vec2 s = vec2(1.0), o = vec2(0.0);
    if (ca > ta) { s.y = ta / ca; }                       // wider canvas: crop height, keep bottom
    else         { s.x = ca / ta; o.x = (1.0 - s.x)*0.5; } // taller canvas: crop sides, centered
    return uv * s + o;
  }

  void main(){
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;

    // aspect-corrected vector to cursor for circular falloff
    vec2 tm = vec2((uv.x - uMouse.x) * aspect, uv.y - uMouse.y);
    float d = length(tm);
    float influence = smoothstep(0.5, 0.0, d) * uMotion;

    vec2 dir  = tm / (d + 1e-4);
    vec2 perp = vec2(-dir.y, dir.x);

    // swirl + gentle push away from the cursor, modulated by flowing noise
    float mod1 = 0.7 + 0.3 * noise(uv * 3.0 + uTime * 0.15);
    vec2 disp = (perp * 0.055 + dir * 0.03) * influence * mod1;

    // idle breathing + a slower deep drift so the field visibly lives on its own
    vec2 idle = vec2(
      noise(uv * 2.5 + uTime * 0.05),
      noise(uv * 2.5 - uTime * 0.04)
    ) * 0.02 * uMotion;
    vec2 drift = vec2(
      noise(uv * 1.6 + uTime * 0.07),
      noise(uv * 1.7 - uTime * 0.05)
    ) * 0.022 * uMotion;

    vec4 tex = texture2D(uTex, coverUv(uv + disp + idle + drift));
    // composite over white (the PNG fade may be alpha-based)
    vec3 col = mix(vec3(1.0), tex.rgb, tex.a);

    // faint sheen following the cursor
    col += influence * 0.05;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function TexturePlane({ motionAmount }: { motionAmount: number }) {
  const tex = useLoader(THREE.TextureLoader, "/assets/hero-texture.png");
  const mouse = useRef(new THREE.Vector2(0.5, 0.6));
  const target = useRef(new THREE.Vector2(0.5, 0.6));

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTexRes: { value: new THREE.Vector2(tex.image.width, tex.image.height) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.6) },
      uMotion: { value: motionAmount },
    }),
    [tex, motionAmount]
  );

  tex.colorSpace = THREE.SRGBColorSpace;

  // Track the pointer on window, not the canvas: the texture sits at z-0 under
  // the content grid, so canvas-local pointer events die on whatever's above it.
  const { gl } = useThree();
  const lastMove = useRef(-10);
  useEffect(() => {
    if (motionAmount === 0) return;
    const onMove = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect();
      if (r.height < 2) return;
      lastMove.current = performance.now() / 1000;
      target.current.set(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height // GL v: up
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl, motionAmount]);

  useFrame((state, delta) => {
    // pointer quiet for a bit → a phantom cursor wanders a slow lissajous path,
    // so the swirl keeps living on its own
    const t = state.clock.elapsedTime;
    const idleFor = performance.now() / 1000 - lastMove.current;
    if (idleFor > 2.5) {
      target.current.set(
        0.5 + 0.38 * Math.sin(t * 0.21),
        0.55 + 0.28 * Math.sin(t * 0.33 + 1.7)
      );
    }
    mouse.current.lerp(target.current, Math.min(1, delta * (idleFor > 2.5 ? 1.2 : 3.5)));
    uniforms.uMouse.value.copy(mouse.current);
    uniforms.uTime.value = t;
    uniforms.uRes.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial fragmentShader={fragment} vertexShader={vertex} uniforms={uniforms} />
    </mesh>
  );
}

export default function InteractiveTexture({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef);

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 2]}
        frameloop={reduce || !inView ? "demand" : "always"}
        resize={{ debounce: 0 }} /* keep the buffer in step with the collapsing band */
      >
        <Suspense fallback={null}>
          <TexturePlane motionAmount={reduce ? 0 : 1} />
        </Suspense>
      </Canvas>
    </div>
  );
}
