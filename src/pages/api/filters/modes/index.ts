import { allModesTable } from "@/db/schema";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {

    const id = new URL(request.url).searchParams.get("id");
  
    const ts = Date.now();
    const response = await drizzle(locals.runtime.env.DB)
        .select()
        .from(allModesTable)
        .where((id ? eq(allModesTable.id, id) : undefined))

    // TODO order by uses?

    return new Response(JSON.stringify({
        mode: "normal",
        bestItems: [],
        items: response,
        maybeItems: [],
        count: response.length,
        times: {
            total: Date.now() - ts
        },
        cached: false
    }))

}