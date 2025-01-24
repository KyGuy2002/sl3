import { allTagsTable, modesTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {

    const modeId = new URL(request.url).searchParams.get("modeId");
    if (!modeId) return new Response("Missing modeId query parameter", { status: 400 });
  
    const response = await drizzle(locals.runtime.env.DB)
        .select()
        .from(allTagsTable)
        .where(
            eq(allTagsTable.modeId, modeId),
        )

        // TODO order by uses?

    return new Response(JSON.stringify(response))

}