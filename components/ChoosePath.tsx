'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './ChoosePath.module.css';
import SocialLinks from './SocialLinks';
import BottomFade from './BottomFade';
import whoAreYou from '@/public/who-are-you.png';
import dottedBar from '@/public/dotted-bar.png';
import dottedBar2 from '@/public/dotted-bar-2.png';

const ARTIST_HREF = 'https://www.beatstars.com/stvrkoutside';
const PRODUCER_HREF = 'https://payhip.com/b/tlsq9';

/*
 * How far into the viewport an element has to be before it starts fading. Negative
 * bottom margin pulls the trigger line up from the bottom edge, so nothing begins while
 * it's still clipping the very bottom of the screen.
 */
const TRIGGER_MARGIN = '0px 0px -22% 0px';

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
        {/*
         * Supplied as artwork rather than live text: the halftone-on-a-gradient
         * treatment is baked into the PNG. The <h1> keeps it in the document outline.
         */}
        <h1 className={styles.question}>
          <Image src={whoAreYou} alt="who are you?" sizes="85vw" />
        </h1>

        <a
          className={`${styles.choice} ${styles.artist}`}
          href={ARTIST_HREF}
          data-reveal=""
        >
          artist
        </a>
        {/*
         * The bars go to the same place as the word beside them. Hidden from assistive
         * tech and out of the tab order so they aren't a second stop for the same
         * destination — they're a bigger tap target, not a separate link.
         */}
        <a
          className={`${styles.bar} ${styles.artistBar}`}
          href={ARTIST_HREF}
          aria-hidden="true"
          tabIndex={-1}
          data-reveal=""
        >
          <Image src={dottedBar} alt="" sizes="55vw" />
        </a>

        <a
          className={`${styles.choice} ${styles.producer}`}
          href={PRODUCER_HREF}
          data-reveal=""
        >
          producer
        </a>
        <a
          className={`${styles.bar} ${styles.producerBar}`}
          href={PRODUCER_HREF}
          aria-hidden="true"
          tabIndex={-1}
          data-reveal=""
        >
          <Image src={dottedBar2} alt="" sizes="55vw" />
        </a>

        <SocialLinks className={styles.socials} data-reveal="" />
      </div>

      <BottomFade />
    </section>
  );
}
