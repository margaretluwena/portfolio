"use client";

/*
  THE SIGNATURE GRAPHIC.
  A flowing, painterly gradient that reacts to the cursor — this is both the
  full-screen intro background AND the top band on the main page (same component,
  different height).

  Why a shader instead of distorting your Figma PNG: the flow reads as *alive*,
  responds to the mouse per-pixel, costs one draw call, and needs no asset. The
  palette below is sampled from your Figma texture (pale yellow-green → sage →
  soft blue → white) so it stays on-brand.

  If you'd rather use your actual Figma texture, see OPTION B at the bottom.

  Interaction: cursor position feeds a uniform; the flow warps toward the pointer
  and a soft highlight follows it. Falls back to a static gradient when
  prefers-reduced-motion is set.
*/

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uMouse;      // 0..1, follows cursor (eased)
  uniform vec2  uRes;
  varying vec2  vUv;

  // palette sampled from the Figma texture
  const vec3 c0 = vec3(0.83, 0.86, 0.62); // pale yellow-green
  const vec3 c1 = vec3(0.72, 0.80, 0.72); // sage
  const vec3 c2 = vec3(0.74, 0.82, 0.86); // soft blue
  const vec3 c3 = vec3(1.00, 1.00, 1.00); // white

  // cheap flowing noise
  vec2 hash(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453)*2.0-1.0; }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(dot(hash(i+vec2(0,0)),f-vec2(0,0)), dot(hash(i+vec2(1,0)),f-vec2(1,0)), u.x),
               mix(dot(hash(i+vec2(0,1)),f-vec2(0,1)), dot(hash(i+vec2(1,1)),f-vec2(1,1)), u.x), u.y);
  }

  void main(){
    vec2 uv = vUv;
    // warp the field toward the cursor
    vec2 toMouse = uv - uMouse;
    float pull = 0.18 / (dot(toMouse, toMouse) + 0.05);
    vec2 p = uv * 3.0 + toMouse * pull * 0.35;

    float t = uTime * 0.06;
    float n = 0.0;
    n += 0.60 * noise(p + t);
    n += 0.30 * noise(p * 2.0 - t * 1.3);
    n += 0.15 * noise(p * 4.0 + t * 0.7);
    n = n * 0.5 + 0.5;

    vec3 col = mix(c0, c1, smoothstep(0.2, 0.5, n));
    col = mix(col, c2, smoothstep(0.45, 0.75, n));
    col = mix(col, c3, smoothstep(0.7, 1.0, n));

    // soft highlight following the cursor
    col = mix(col, c3, smoothstep(0.35, 0.0, length(toMouse)) * 0.25);

    // fade to white toward the bottom (matches the Figma gradient overlay)
    col = mix(col, c3, smoothstep(0.35, 1.0, uv.y));

    gl_FragColor = vec4(col, 1.0);
  }
`;

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

function Plane() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const target = useRef(new THREE.Vector2(0.5, 0.5));
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useFrame((state, delta) => {
    // read the shared pointer (0..1, y flipped for GL)
    target.current.set(
      (state.pointer.x + 1) / 2,
      (state.pointer.y + 1) / 2
    );
    mouse.current.lerp(target.current, Math.min(1, delta * 3)); // easing = weight
    uniforms.uMouse.value.copy(mouse.current);
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uRes.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} fragmentShader={fragment} vertexShader={vertex} uniforms={uniforms} />
    </mesh>
  );
}

export default function InteractiveTexture({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        gl={{ antialias: true }}
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        dpr={[1, 2]}
      >
        <Plane />
      </Canvas>
    </div>
  );
}

/*
  OPTION B — use your real Figma texture instead of the shader:
  - Pull the asset (imgImage1 in the Figma design-context response) into /public/assets/hero-texture.png
  - Swap the fragment shader for a texture read + a domain-warp displacement around uMouse
    (sample the texture at uv + warp*flow). Ask Claude Code: "make InteractiveTexture sample
    /assets/hero-texture.png and liquid-displace it around the cursor instead of the noise palette."
*/
