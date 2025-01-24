import { allModesTable } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {
  
    const response = await drizzle(locals.runtime.env.DB)
        .select()
        .from(allModesTable)

        // TODO order by uses?

    return new Response(JSON.stringify(response))

}