"use client";
//import type { Metadata } from "next";
//import { Inter } from "next/font/google";
//import "./globals.css";

//import { Analytics } from '@vercel/analytics/react';
import ReactGA from "react-ga4";

import {
  GA4_TOKEN,
  GSC_TOKEN,
  SITE_DESCRIPTION,
  SITE_PREVIEW,
  SITE_THEME_COLOR_1,
  SITE_TITLE,
  SITE_URL,
} from "./config";
//const inter = Inter({ subsets: ["latin"] });
ReactGA.initialize(GA4_TOKEN);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{ backgroundColor:"rgba(0,0,0,0)", height: "100%" }}
    >
      <head>
        <title>{SITE_TITLE}</title>
        <meta name="google-site-verification" content={GSC_TOKEN} />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="og:description" content={SITE_DESCRIPTION} />
        <meta name="og:url" content={SITE_URL} />
        <meta property="og:image" content={SITE_PREVIEW} />
      </head>
      <body>{children}</body>
    </html>
  );
}
