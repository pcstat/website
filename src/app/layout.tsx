import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import Script from 'next/script';
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
      <head />
      <body>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })()
            `,
          }}
        />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
