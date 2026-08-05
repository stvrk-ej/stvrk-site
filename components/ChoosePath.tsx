'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './ChoosePath.module.css';
import SocialLinks from './SocialLinks';
import BottomFade from './BottomFade';
import dottedBar from '@/public/dotted-bar.png';
import dottedBar2 from '@/public/dotted-bar-2.png';
import { BEATS_HREF, SOUNDKITS_HREF, PORTFOLIO_HREF } from '@/lib/links';

/*
 * How far into the viewport an element has to be before it starts fading. Negative
 * bottom margin pulls the trigger line up from the bottom edge, so nothing begins while
 * it's still clipping the very bottom of the screen.
 */
const TRIGGER_MARGIN = '0px 0px -22% 0px';

/*
 * Each row is a flex pair (text + bar) rather than two independently absolutely
 * positioned elements. That's what makes the text/bar gap hold for any word length:
 * the bar's width is "whatever space is left after the text and the gap," not a fixed
 * cqw number tuned to one specific word. See .row in the stylesheet.
 */
const CHOICES = [
  {
    label: 'beats',
    href: BEATS_HREF,
    bar: dottedBar,
    rowClass: styles.rowBeats,
  },
  {
    label: 'sound-kits',
    href: SOUNDKITS_HREF,
    bar: dottedBar2,
    rowClass: `${styles.rowSoundKits} ${styles.rowReverse}`,
  },
  {
    label: 'portfolio',
    href: PORTFOLIO_HREF,
    bar: dottedBar,
    rowClass: styles.rowPortfolio,
  },
];

export default function ChoosePath() {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = innerRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    if (!items.length) return;

    const show = (el: HTMLElement) => {
      el.classList.remove(styles.pending);
      el.classList.add(styles.revealed);
    };

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      items.forEach(show);
      return;
    }

    /*
     * Hidden only after mount, so the server-rendered panel is visible without JS. It
     * starts below the fold, so nobody sees the moment it flips to hidden.
     */
    items.forEach((el) => el.classList.add(styles.pending));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target as HTMLElement);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: TRIGGER_MARGIN, threshold: 0.01 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.path}>
      {/*
       * Runway for the hero layers to drift through before any text arrives. The logo
       * is the slowest layer and ends up furthest into this panel — about 0.36 of a
       * viewport at its lowest — so this stays clear of it with room to spare.
       */}
      <div className={styles.lead} />

      <div ref={innerRef} className={styles.inner}>
        {CHOICES.map(({ label, href, bar, rowClass }) => (
          <div key={label} className={`${styles.row} ${rowClass}`}>
            <a className={styles.choice} href={href} data-reveal="">
              {label}
            </a>
            {/*
             * Goes to the same place as the word beside it. Hidden from assistive tech
             * and out of the tab order so it isn't a second stop for the same
             * destination — it's a bigger tap target, not a separate link.
             */}
            <a
              className={styles.bar}
              href={href}
              aria-hidden="true"
              tabIndex={-1}
              data-reveal=""
            >
              <Image src={bar} alt="" sizes="45vw" />
            </a>
          </div>
        ))}

        <SocialLinks className={styles.socials} data-reveal="" />
      </div>

      <BottomFade />
    </section>
  );
}
