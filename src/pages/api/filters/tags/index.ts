import { allTagsTable } from "@/db/schema";
import type { APIContext } from "astro";
import { eq, inArray, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {

    const modeId = new URL(request.url).searchParams.get("modeId");
    const tagIds = new URL(request.url).searchParams.get("ids");
    if (modeId && tagIds) return new Response("Cannot have both modeId AND tagIds", { status: 400 });
    
  
    const ts = Date.now();
    const response = await drizzle(locals.runtime.env.DB)
        .select()
        .from(allTagsTable)
        .where(or(
            (tagIds ? inArray(allTagsTable.id, tagIds.split(",")) : undefined),
            (modeId ? eq(allTagsTable.modeId, modeId) : undefined),
        ))


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