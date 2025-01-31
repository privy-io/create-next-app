import '../styles/globals.css';
import PrivyProvider from "../components/privy-provider";
import { Metadata } from "next";
import localFont from 'next/font/local'
import Head from 'next/head';

export const metadata: Metadata = {
  title: "Privy Auth Demo",
  description: "Privy Auth Demo",
};

const adelleSans = localFont({
  src: [
    {
      path: '../public/fonts/AdelleSans-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/AdelleSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/AdelleSans-Semibold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/AdelleSans-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${adelleSans.className}`}>
      <Head>
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
      </Head>
      <body>
        <PrivyProvider>
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}