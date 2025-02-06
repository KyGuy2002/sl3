import type { APIContext } from "astro";
import { runFtsQuery } from "../../queryUtils";


export async function GET({ params, request, locals }: APIContext) {

    const query = new URL(request.url).searchParams.get("q");
    if (!query) return new Response("No query provided", { status: 400 });

    const ts = Date.now();
    const res = await runFtsQuery(locals.runtime.env, "modes", query);

    res.forEach((element: any) => {
        element.aka = JSON.parse(element.aka);
    });

    return new Response(JSON.stringify({
        mode: "normal",
        bestItems: res,
        items: [],
        maybeItems: [],
        count: res.length,
        times: {
            total: Date.now() - ts
        },
        cached: false
    }));


    // const type = new URL(request.url).searchParams.get("type");
    // if (!type) return new Response("No type provided", { status: 400 });

    // if (type == "fts") return new Response(JSON.stringify(await runFtsQuery(locals.runtime.env, "modes", query)));
    // else if (type == "semantic") return new Response(JSON.stringify(await runFtsQuery(locals.runtime.env, "modes", query)));
    // else return new Response("Invalid type", { status: 400 });

}
