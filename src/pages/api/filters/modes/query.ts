import type { APIContext } from "astro";
import { runFtsQuery, runQuery } from "../../queryUtils";


export async function GET({ params, request, locals }: APIContext) {


    const query = new URL(request.url).searchParams.get("q");
    if (!query) return new Response("No query provided", { status: 400 });

    // const res = await runQuery(locals.runtime.env, "modes", query);

    // return new Response(JSON.stringify(res))

    const res1 = await runFtsQuery(locals.runtime.env, "modes", query);


    return new Response(JSON.stringify({
        mode: "normal",
        bestItems: res1,
        items: [],
        maybeItems: [],
        count: res1.length,
        times: {
            total: -1
        },
        cached: false
    }));

}
