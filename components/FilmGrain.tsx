'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './FilmGrain.module.css';

/*
 * Animated film grain over the whole page.
 *
 * A fullscreen quad with a hash-noise fragment shader, redrawn on a timer. Three things
 * keep it cheap enough to sit on top of a video, two blend layers and a parallax loop:
 *
 *  - It renders at half resolution and is stretched by CSS. Grain wants to be slightly
 *    soft anyway, and this quarters the fill cost.
 *  - It updates at ~24fps, not 60. Film grain at 60fps reads as electronic fizz; 24 is
 *    both cheaper and more filmic.
 *  - The noise is mostly luma with only a little channel decorrelation, so it reads as
 *    film rather than colour static.
 *
 * Falls back to a static CSS grain when WebGL is unavailable, and freezes on a single
 * frame under prefers-reduced-motion.
 */

const FPS = 24;
const CHROMA = 0.35; // 0 = monochrome, 1 = full RGB static
// Coarser than 1:1 on purpose — one noise texel covers ~3 CSS px, which reads as grain
// rather than fizz and costs less fill. Lower this number for chunkier grain.
const SCALE = 0.5; // render resolution multiplier

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform float uTime;
uniform float uChroma;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 p = gl_FragCoord.xy + uTime;
  vec3 n = vec3(hash(p), hash(p + 13.37), hash(p + 71.21));
  float luma = (n.r + n.g + n.b) / 3.0;
  n = mix(vec3(luma), n, uChroma);
  // Pull the range in around mid grey so the texture stays restrained.
  n = 0.5 + (n - 0.5) * 0.78;
  gl_FragColor = vec4(n, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) {
      setFallback(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = vs && fs ? gl.createProgram() : null;
    if (!vs || !fs || !program) {
      setFallback(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uChroma = gl.getUniformLocation(program, 'uChroma');
    gl.uniform1f(uChroma, CHROMA);

    const resize = () => {
      const w = Math.max(1, Math.round(window.innerWidth * SCALE));
      const h = Math.max(1, Math.round(window.innerHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = (seed: number) => {
      gl.uniform1f(uTime, seed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (still.matches) {
      // One frame, no loop: the texture is still there, it just doesn't move.
      draw(Math.random() * 1000);
      window.addEventListener('resize', () => {
        resize();
        draw(Math.random() * 1000);
      });
      return;
    }

    let raf = 0;
    let last = 0;
    const interval = 1000 / FPS;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < interval) return;
      last = now;
      resize();
      draw((now * 0.05) % 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  if (fallback) return <div className={`${styles.grain} ${styles.static}`} aria-hidden="true" />;

  return <canvas ref={canvasRef} className={styles.grain} aria-hidden="true" />;
}
