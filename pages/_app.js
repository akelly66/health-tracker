import '../styles/app.css';
import { DM_Sans } from 'next/font/google';

// Downloaded at build time and served from this site, so the page never waits on a request to Google for its font.
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });

export default function App({ Component, pageProps }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root{--font-dm-sans:${dmSans.style.fontFamily}}` }} />
      <Component {...pageProps} />
    </>
  );
}
