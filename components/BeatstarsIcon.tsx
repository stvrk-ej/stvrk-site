/*
 * PLACEHOLDER — not the real BeatStars mark.
 *
 * This is a stand-in so the row has the right rhythm and the right number of icons.
 * Swap it for the real mark before launch; see the note in SocialLinks.tsx.
 */
export default function BeatstarsIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5.5 2.5h13a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3h-13a3 3 0 0 1-3-3v-13a3 3 0 0 1 3-3Zm2.9 3.6v11.8h4.9a3.2 3.2 0 0 0 1.9-5.8 3 3 0 0 0-1.5-5.4l-.6-.06H8.4Zm2.6 2.2h2a1.2 1.2 0 0 1 0 2.4h-2V8.3Zm0 4.5h2.4a1.3 1.3 0 0 1 0 2.6H11v-2.6Z" />
    </svg>
  );
}
