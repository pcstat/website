import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import PreviewBridge from '@/components/PreviewBridge';
import { SITE_URL } from '@/lib/config';
import { getSite } from '@/lib/database/server';
import { SiteProvider } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
  const { club } = await getSite();
  return {
    title: club.browser_title,
    description: club.description,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: club.browser_title,
      description: club.share_description,
      images: '/resources/images/favicon.svg',
      url: SITE_URL,
    },
    icons: {
      icon: '/resources/images/favicon.svg',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSite();
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/*
          Applies the saved theme before the first paint (no flash). It is a plain inline <script> in <head> —
          not next/script — because next/script renders a <script> inside the React tree in <body>, and React
          warns: "Encountered a script tag while rendering React component".
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <SiteProvider value={site}>
          <PreviewBridge />
          <LayoutWrapper>{children}</LayoutWrapper>
        </SiteProvider>
      </body>
    </html>
  );
}
