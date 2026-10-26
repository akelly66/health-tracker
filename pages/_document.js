import { Html, Head, Main, NextScript } from 'next/document';
import { palette, themeCss } from '../lib/theme';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="mise" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Browser tab icon */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-32.png" sizes="32x32" type="image/png" />

        {/* Theme color */}
        <meta name="theme-color" content={palette.cream} />

        {/* Design tokens: the only source of color values (see lib/theme.js and DESIGN.md) */}
        <style id="design-tokens" dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
