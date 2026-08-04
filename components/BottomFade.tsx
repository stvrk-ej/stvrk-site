'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './ChoosePath.module.css';
import halftoneFade from '@/public/halftone-fade.png';
import halftoneFadeDesktop from '@/public/halftone-fade-desktop.png';

/*
 * The halftone that closes the page out in black, with a little drift.
 *
 * It settles up into place and fades in as you reach the foot of the page. The drift is
 * downward-only — it starts low and rises to rest. Pushing it *up* past its resting
 * place is what opens a white sliver at the very bottom, which is the one thing this
 * element must never do; the artwork hangs ~0.2 of a viewport below the page inside a
 * clipping box, so travelling down just buries more of the black overhang.
 *
 * Progress is distance to the foot of the page, not the element's position in the
 * viewport. The geometric version looked right on desktop and was wrong on a phone: the
 * element is sized in `svh`, but `innerHeight` grows past that when mobile browser
 * chrome collapses, so it never quite reached its resting position.
 */
const DROP = 64; // px it starts below its resting place
const TRAVEL = 0.35; // fraction of a viewport the drift plays out over

export default function BottomFade() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const doc = document.documentElement;
      const remaining = doc.scrollHeight - window.innerHeight - window.scrollY;
      const travel = window.innerHeight * TRAVEL;
      // 1 at the foot of the page, 0 a third of a screen above it.
      const p = Math.max(0, Math.min(1, 1 - remaining / travel));
      el.style.transform = `translate3d(0, ${(1 - p) * DROP}px, 0)`;
      el.style.opacity = String(0.45 + 0.55 * p);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={styles.fade} aria-hidden="true">
      <div ref={ref} className={styles.fadeInner}>
        {/*
         * Two files, one shown per breakpoint — see .fadeDesktop in the stylesheet for
         * why desktop needs its own. Both are lazy, so the hidden one never downloads.
         */}
        <Image className={styles.fadeMobile} src={halftoneFade} alt="" sizes="100vw" />
        <Image
          className={styles.fadeDesktop}
          src={halftoneFadeDesktop}
          alt=""
          sizes="100vw"
        />
      </div>
    </div>
  );
}
