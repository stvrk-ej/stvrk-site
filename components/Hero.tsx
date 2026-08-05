'use client';

import { Fragment, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';
import SpinningLogo from './SpinningLogo';
import wordmark from '@/public/wordmark.png';
import { BEATS_HREF, SOUNDKITS_HREF, PORTFOLIO_HREF } from '@/lib/links';

const NAV_ITEMS = [
  { label: 'beats', href: BEATS_HREF },
  { label: 'sound-kits', href: SOUNDKITS_HREF },
  { label: 'portfolio', href: PORTFOLIO_HREF },
];

/*
 * The hero, as three parallax layers.
 *
 *   logo   — slowest (0.42)
 *   mark   — the wordmark and the beats/sound-kits row (0.58)
 *   border — the top edge of the white panel, which just scrolls at 1.0
 *
 * The border is therefore the fastest of the three and sweeps up across the other two.
 * Where it crosses them, `mix-blend-mode: difference` in the stylesheet flips them from
 * white to black per pixel, so they stay readable against whichever side they're on.
 *
 * The layers are plain absolutely-positioned siblings of the white panel, not sticky or
 * fixed. That's deliberate: `position: sticky` and `position: fixed` both create a
 * stacking context, which isolates the blend and leaves the layers unable to "see" the
 * white panel as their backdrop. Pinning is done by transform instead — an element at
 * document top translated by s*(1-k) tracks the viewport at rate k.
 */

/*
 * Rates are capped by a collision, not by taste. The mark layer starts 0.23vh below the
 * bottom of the logo's dot field and closes that gap at (MARK - LOGO) per viewport
 * scrolled, so anything past ~0.20 difference drives "beats • sound-kits" into the
 * halftone and it stops being readable. 0.16 keeps them apart the whole way down.
 */
const LOGO_RATE = 0.42;
const MARK_RATE = 0.58;

/* Once the sweep is over the layers dissolve rather than loiter above the text. */
const FADE_START = 1.05;
const FADE_END = 1.4;

export default function Hero() {
  const logoRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  /*
   * The nav rides with the mark layer but is a separate element so it can carry its own
   * blend mode — see .navLayer in the stylesheet. Same rate, so they move as one.
   */
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const v = window.innerHeight;
      const y = window.scrollY;
      // Past one viewport the border has finished its sweep; freezing the offset there
      // hands the layers back to normal scrolling so they drift away at page speed.
      const s = Math.min(y, v);
      const fade = 1 - (y / v - FADE_START) / (FADE_END - FADE_START);
      const opacity = String(Math.max(0, Math.min(1, fade)));

      if (logoRef.current) {
        logoRef.current.style.transform = `translate3d(0, ${s * (1 - LOGO_RATE)}px, 0)`;
        logoRef.current.style.opacity = opacity;
      }
      const markShift = `translate3d(0, ${s * (1 - MARK_RATE)}px, 0)`;
      if (markRef.current) {
        markRef.current.style.transform = markShift;
        markRef.current.style.opacity = opacity;
      }
      if (navRef.current) {
        navRef.current.style.transform = markShift;
        navRef.current.style.opacity = opacity;
      }
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
    <>
      {/*
       * Luminance-to-alpha key for the logo. The clip's background is rgb(3,2,4), not
       * #000, and crushing it with contrast() only gets it to *approximately* black —
       * software rounds it to zero, GPUs land a hair above, and that hair shows up as
       * a sharp rectangle edge on a bright screen. This throws the luminance into the
       * alpha channel instead, so the background is genuinely transparent and matches
       * whatever is behind it exactly: black above the border, white below.
       */}
      <svg className={styles.filterDefs} aria-hidden="true" focusable="false">
        <filter id="stvrk-luma-key" colorInterpolationFilters="sRGB">
          {/*
           * Black-point subtraction first. The key below turns luminance into alpha,
           * and rgb(3,2,4) has a luminance of ~2.4/255 — small, but not zero, so the
           * background came out at ~1% alpha and stayed faintly visible at high
           * brightness. This clamps anything under ~9/255 to true zero so the key has a
           * clean floor to work from. White is unaffected: 1.035 - 0.035 = 1.
           */}
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.035" intercept="-0.035" />
            <feFuncG type="linear" slope="1.035" intercept="-0.035" />
            <feFuncB type="linear" slope="1.035" intercept="-0.035" />
          </feComponentTransfer>
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0.2126 0.7152 0.0722 0 0"
          />
        </filter>
      </svg>

      <div ref={logoRef} className={`${styles.layer} ${styles.logoLayer}`}>
        <div className={styles.stage}>
          <SpinningLogo />
        </div>
      </div>

      <div ref={markRef} className={`${styles.layer} ${styles.markLayer}`}>
        <div className={styles.wordmark}>
          <Image src={wordmark} alt="stvrk" priority sizes="85vw" />
        </div>
      </div>

      <div ref={navRef} className={`${styles.layer} ${styles.navLayer}`}>
        <nav className={styles.nav} aria-label="Store">
          {NAV_ITEMS.map((item, i) => (
            <Fragment key={item.label}>
              {i > 0 && <span className={styles.dot} aria-hidden="true" />}
              <a className={styles.navLink} href={item.href}>
                {item.label}
              </a>
            </Fragment>
          ))}
        </nav>
      </div>
    </>
  );
}
