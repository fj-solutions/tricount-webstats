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
  const keys: string[] = JSON.parse(await fs.readFile(filePath, "utf8"));
  if (!keys.includes(key)) keys.push(key);
  await fs.writeFile(filePath, JSON.stringify(keys));
  return new Response(JSON.stringify(keys), { headers: { "Content-Type": "application/json" } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { key } = await request.json();
  const keys: string[] = JSON.parse(await fs.readFile(filePath, "utf8"));
  const filtered = keys.filter(k => k !== key);
  await fs.writeFile(filePath, JSON.stringify(filtered));
  return new Response(JSON.stringify(filtered), { headers: { "Content-Type": "application/json" } });
};
