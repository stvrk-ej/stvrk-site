import { FaXTwitter, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa6';
import BeatstarsIcon from './BeatstarsIcon';
import styles from './SocialLinks.module.css';

/*
 * BeatStars uses a PLACEHOLDER glyph (components/BeatstarsIcon.tsx) — it is not the
 * real mark. react-icons ships Simple Icons as `react-icons/si`, which does carry a
 * BeatStars icon; if that version of the mark is the one you want, replace the import
 * and the entry below with:
 *
 *   import { SiBeatstars } from 'react-icons/si';
 *   { label: 'BeatStars', href: '...', Icon: SiBeatstars },
 */
const LINKS = [
  { label: 'X', href: 'https://x.com/stvrkoutside', Icon: FaXTwitter },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/stvrkoutside/',
    Icon: FaInstagram,
  },
  { label: 'YouTube', href: 'https://www.youtube.com/@prodstvrk', Icon: FaYoutube },
  { label: 'TikTok', href: 'https://www.tiktok.com/@_stvrk', Icon: FaTiktok },
  {
    label: 'BeatStars',
    href: 'https://www.beatstars.com/stvrkoutside',
    Icon: BeatstarsIcon,
  },
];

export default function SocialLinks({
  className,
  ...rest
}: { className?: string } & React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={`${styles.list} ${className ?? ''}`} {...rest}>
      {LINKS.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            className={styles.link}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
          >
            <Icon className={styles.glyph} />
          </a>
        </li>
      ))}
    </ul>
  );
}
