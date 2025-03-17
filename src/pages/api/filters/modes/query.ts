import type { APIContext } from "astro";
import { runQuery } from "../../queryUtils";


export async function GET({ params, request, locals }: APIContext) {


    const query = new URL(request.url).searchParams.get("q");
    if (!query) return new Response("No query provided", { status: 400 });

    const res = await runQuery(locals.runtime.env, "modes", query);


    return new Response(JSON.stringify({
        mode: "normal",
        bestItems: res,
        items: [],
        maybeItems: [],
        count: res.length,
        times: {
            total: -1
        },
        cached: false
    }));

}
