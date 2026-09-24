import React from "react";
import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://digitalbazaar.onrender.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export default function SEO({ title, description, path = "/", noindex = false, image, jsonLd }) {
  const fullTitle = title ? `${title} — DigitalBazaar` : "DigitalBazaar — Honest Prices, Curated Finds";
  const desc =
    description ||
    "Shop curated products sourced directly by us, or find trusted picks from partner stores — all in one place.";
  const url = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
