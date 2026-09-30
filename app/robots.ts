import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "#lib/site";

const robots = (): MetadataRoute.Robots => ({
  rules: { allow: "/", userAgent: "*" },
  sitemap: getAbsoluteUrl("/sitemap.xml"),
});

export default robots;
