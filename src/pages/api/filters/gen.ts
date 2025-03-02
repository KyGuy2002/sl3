import { allModesTable, allTagsTable } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {

    const type = new URL(request.url).searchParams.get("type");
    if (!type || !["tags", "modes"].includes(type)) return new Response("No type provided (tags, modes).", { status: 400 });

    const VEC_TABLE = type == "tags" ? locals.runtime.env.VEC_TAGS : locals.runtime.env.VEC_MODES;
    const DB_TABLE = type == "tags" ? allTagsTable : allModesTable;


    const res = await drizzle(locals.runtime.env.DB)
        .select()
        .from(DB_TABLE)


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

    await VEC_TABLE.upsert(vectors)


    return new Response("Success!")

}