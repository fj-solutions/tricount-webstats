export const prerender = false;
import type { APIRoute } from "astro";
import { promises as fs } from "fs";
import path from "path";
const filePath = path.resolve("./data/tricount-keys.json");

export const GET: APIRoute = async () => {
  const keys = JSON.parse(await fs.readFile(filePath, "utf8"));
  return new Response(JSON.stringify(keys), { headers: { "Content-Type": "application/json" } });
};

export const POST: APIRoute = async ({ request }) => {
  const { key } = await request.json();
  const keys: any[] = JSON.parse(await fs.readFile(filePath, "utf8"));
  // Prüfe, ob Key schon existiert
  if (!keys.some(k => k.key === key)) {
    // Hole Meta von Tricount API!
    let title = "Unbekannt";
    let emoji = "❓";
    try {
      const res = await fetch(`${process.env.ORIGIN || "http://localhost:4321"}/api/update?tricountKey=${key}`);
      const json = await res.json();
      title = json.title || "Unbekannt";
      emoji = json.emoji || "❓";
    } catch {}
    keys.push({ key, title, emoji });
    await fs.writeFile(filePath, JSON.stringify(keys, null, 2));
  }
  return new Response(JSON.stringify(keys), { headers: { "Content-Type": "application/json" } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { key } = await request.json();
  const keys: any[] = JSON.parse(await fs.readFile(filePath, "utf8"));
  const filtered = keys.filter(k => k.key !== key);
  await fs.writeFile(filePath, JSON.stringify(filtered, null, 2));
  return new Response(JSON.stringify(filtered), { headers: { "Content-Type": "application/json" } });
};
