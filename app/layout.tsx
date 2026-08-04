import type { Metadata, Viewport } from 'next';
import { EB_Garamond } from 'next/font/google';
import './globals.css';
import FilmGrain from '@/components/FilmGrain';

/*
 * EB Garamond. The mockups were set in Apple Garamond, which is Apple/Bitstream's
 * proprietary 1991 face with no webfont licence — not something we can ship. This is
 * the closest freely-licensed Garamond; it runs a little wider and has a smaller
 * x-height, which is why the type sizes below are tuned to match the reference by
 * word width rather than by nominal point size.
 */
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-garamond',
});

export const metadata: Metadata = {
  title: 'stvrk',
  description: 'beats and sound-kits by stvrk',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  initialScale: 1,
  width: 'device-width',
  // The black panel runs edge to edge behind the status bar.
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={ebGaramond.variable}>
      <body style={{ fontFamily: 'var(--font-garamond), Georgia, serif' }}>
        {children}
        {/* Above everything, so it textures the finished frame rather than joining it. */}
        <FilmGrain />
      </body>
    </html>
  );
}
