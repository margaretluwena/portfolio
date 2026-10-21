import { works } from "@/lib/works";

/*
  /llms.txt - a plain-text map of the site for language models and crawlers
  that read it (Shub's feedback, 2026-10-13: keep it, and make sure it
  summarises the nested pages too). Generated from the works data at
  request time so it never goes stale; the static page lines are the
  metadata descriptions in app/.
*/

const SITE = "https://margaretluwena.net";

export const dynamic = "force-static";

export function GET() {
  const studies = works.filter((w) => !w.play);
  const play = works.filter((w) => w.play);
  const lines: string[] = [
    "# Margaret Luwena",
    "",
    "> Designer at USC, cofounding Traeco (cost intelligence for AI agents) and running BUILD, USC's premier student-run startup accelerator at TroyLabs.",
    "",
    "## Pages",
    "",
    `- [Home](${SITE}/): bio, contact, and the selected works column.`,
    `- [About](${SITE}/about): the long bio, work experiences, and involvements (TroyLabs, LavaLab, Verci LA).`,
    `- [Works](${SITE}/works): every work as a tile.`,
    `- [Play](${SITE}/play): graphics and small works.`,
    "",
    "## Works",
    "",
    ...studies.map((w) => {
      const open = !w.comingSoon;
      const where = open ? `[${w.title}](${SITE}/works/${w.slug})` : `${w.title} (case study coming soon)`;
      const meta = [w.category, w.year, w.role].filter((v) => v && v !== "NEED").join(", ");
      const lede = w.lede && w.lede !== "NEED" ? ` ${w.lede.replace(/\.$/, "")}.` : "";
      return `- ${where}: ${meta}.${lede}`;
    }),
    "",
    "## Play",
    "",
    ...play.map((w) => `- [${w.title}](${SITE}/play): ${w.lede && w.lede !== "NEED" ? w.lede : w.category}.`),
    "",
    "## Contact",
    "",
    "- Email: luwena@usc.edu",
    "- LinkedIn: https://www.linkedin.com/in/margaretluwena/",
    "- X: https://x.com/marluwena",
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
