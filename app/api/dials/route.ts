import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

/*
  Dev-only: a DialKit panel's "Save as defaults" posts its current values
  here and they are written to lib/dials/<id>.json, which is where the
  animation components read their defaults from. So what Margaret saves is
  what the next build ships (2026-10-29). Refuses to run outside
  development and only ever writes inside lib/dials.
*/
const IDS = new Set(["integration-snippet", "before-after-slider", "research-funnel"]);

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") return new NextResponse("Not found", { status: 404 });
  const body = (await req.json().catch(() => null)) as { id?: string; values?: Record<string, unknown> } | null;
  if (!body || typeof body.id !== "string" || !IDS.has(body.id) || !body.values || typeof body.values !== "object") {
    return NextResponse.json({ error: "expected { id: <known panel>, values: {…} }" }, { status: 400 });
  }
  const file = path.join(process.cwd(), "lib", "dials", `${body.id}.json`);
  await fs.writeFile(file, JSON.stringify(body.values, null, 2) + "\n", "utf8");
  return NextResponse.json({ ok: true, file: path.relative(process.cwd(), file) });
}
