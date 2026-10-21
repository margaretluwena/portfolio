import type { MetadataRoute } from "next";
import { works } from "@/lib/works";

const BASE = "https://margaretluwena.net";

/* reachable routes only - comingSoon slugs redirect home and
   PLAY collections have no pages */
export default function sitemap(): MetadataRoute.Sitemap {
  const studies = works
    .filter((w) => !w.comingSoon && !w.play)
    .map((w) => ({ url: `${BASE}/works/${w.slug}`, priority: 0.8 }));
  return [
    { url: BASE, priority: 1 },
    { url: `${BASE}/works`, priority: 0.9 },
    { url: `${BASE}/about`, priority: 0.7 },
    { url: `${BASE}/play`, priority: 0.5 },
    ...studies,
  ];
}
