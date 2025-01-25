import type { APIContext } from "astro";
import { runQuery } from "../../queryUtils";


export async function GET({ params, request, locals }: APIContext) {

    const query = new URL(request.url).searchParams.get("q");
    if (!query) return new Response("No query provided", { status: 400 });
    const modeId = new URL(request.url).searchParams.get("modeId");
    if (!modeId) return new Response("No modeId provided", { status: 400 });

    const res = await runQuery(locals.runtime.env, "tags", query, modeId);

    return new Response(JSON.stringify(res));

}
