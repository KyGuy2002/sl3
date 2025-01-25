import { allModesTable, allTagsTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {


    const res = await drizzle(locals.runtime.env.DB)
        .select()
        .from(allTagsTable)


    const { data: embeddings } = await locals.runtime.env.AI.run(
        "@cf/baai/bge-base-en-v1.5",
        {
            text: res.map((item) =>
                item.name + ".  " + item.desc + ".  " + (item.aka as string[]).join(", ")
            )
        }
    );

    const vectors = res.map((item, i) => ({
        id: item.id,
        values: embeddings[i],
        namespace: item.modeId // Mode ID to filter tags
    }));

    await locals.runtime.env.VEC_TAGS.upsert(vectors)


    return new Response("Success!")

}