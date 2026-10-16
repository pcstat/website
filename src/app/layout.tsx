import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import PreviewBridge from '@/components/PreviewBridge';
import { SITE_URL } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Statistics Programming Club - CU',
  description: 'A community of data-driven programmers. Competitive programming, machine learning projects, and weekly meetups at the Department of Statistics, University of Chittagong.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Statistics Programming Club - CU',
    description: 'We write code. We build things. We compete.',
    images: '/resources/images/favicon.svg',
    url: SITE_URL,
  },
  icons: {
    icon: '/resources/images/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <PreviewBridge />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
