'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';
import logoFrame from '@/public/logo-frame.png';

/*
 * The logo, with a still-frame fallback.
 *
 * iOS Low Power Mode refuses to autoplay a <video> no matter how it's encoded, and
 * Safari then draws its own play button over the element. So the first frame of the
 * clip sits *on top* as an overlay, covering the video until playback is confirmed —
 * which means the play button is never visible, even for the moment before we detect
 * the failure. Low Power Mode simply gets a still logo.
 *
 * Two things this deliberately does NOT do, both verified in a browser:
 *
 *  - It never hides the <video> itself. A video at `opacity: 0` has play() resolve
 *    and then never advance a single frame, so "did it start?" becomes undetectable
 *    and the clip is dead for everyone, not just Low Power Mode.
 *  - It doesn't rely on play() resolving as proof of playback. It waits for
 *    currentTime to actually move.
 *
 * Covering the video with an opaque sibling does not affect playback, so the overlay
 * is safe to leave in place.
 */
export default function SpinningLogo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Starts covered so the first paint is the still frame, never a play button.
  const [covered, setCovered] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // A big rotating graphic is exactly what this setting is for — stay covered.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const reveal = () => {
      if (!video.paused && video.currentTime > 0) setCovered(false);
    };
    const cover = () => setCovered(true);

    video.addEventListener('timeupdate', reveal);
    video.addEventListener('playing', reveal);
    video.addEventListener('pause', cover);
    video.addEventListener('error', cover);

    // autoPlay covers browsers that allow it; this catches the rejection where it fails.
    video.play().catch(cover);

    return () => {
      video.removeEventListener('timeupdate', reveal);
      video.removeEventListener('playing', reveal);
      video.removeEventListener('pause', cover);
      video.removeEventListener('error', cover);
    };
  }, []);

  return (
    <div className={styles.videoWrap}>
      <video
        ref={videoRef}
        className={styles.video}
        src="/spinning-logo.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      />
      <Image
        className={`${styles.frame} ${covered ? styles.frameShown : ''}`}
        src={logoFrame}
        alt=""
        priority
        sizes="140vw"
      />
    </div>
  );
}
