import React from "react";
import { Helmet } from "react-helmet-async";

export default function SEO({ title, description, path = "/", noindex = false }) {
  const fullTitle = title ? `${title} — Bazaar` : "Bazaar — Honest prices, curated finds";
  const desc =
    description ||
    "Shop curated products sourced directly by us, or find trusted picks from partner stores — all in one place.";
  const url = `https://www.yourdomain.com${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
    </Helmet>
  );
}
