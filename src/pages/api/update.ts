export const prerender = false;

import type { APIRoute } from "astro";
import { TricountAPI } from "../../lib/TricountAPI";
import { TricountHandler } from "../../lib/TricountHandler";

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const tricountKey = searchParams.get("tricountKey") || "DEFAULTKEY";

    if (!tricountKey || tricountKey === "null") {
      return new Response(
        JSON.stringify({ error: "Kein TricountKey angegeben!" }),
        { status: 400 }
      );
    }

    const api = new TricountAPI();
    await api.authenticate();
    const data = await api.fetchTricountData(tricountKey);

    if (!data.Response || !data.Response.length || !data.Response[0].Registry) {
      return new Response(
        JSON.stringify({ error: "Kein Tricount gefunden oder Tricount ist leer." }),
        { status: 404 }
      );
    }

    const meta = TricountHandler.getMetaData(data);
    const { memberships, transactions } = TricountHandler.parseData(data);
    const stats = TricountHandler.calculateStats(memberships, transactions);

    return new Response(
      JSON.stringify({
        ...meta,
        ...stats,
        memberships,
        transactions
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
