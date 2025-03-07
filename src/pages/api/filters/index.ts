import type { APIContext } from "astro";
import type { ModeDetailsType, TagDetailsType } from "../server/utils";
import { drizzle } from "drizzle-orm/d1";
import { allModesTable, allTagsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import _ from "lodash";


export async function POST({ params, request, locals }: APIContext) {
    const body: { tags: TagDetailsType[], modes: ModeDetailsType[] } = await request.json();

    if (!body.tags || !body.modes) return new Response('Invalid body', { status: 400 });
    
    await processItems(locals.runtime.env, "tag", body.tags);
    console.log("========")
    await processItems(locals.runtime.env, "mode", body.modes);


    return new Response('OK', { status: 200 });

}



async function processItems(env: any, type: "tag" | "mode", items: (ModeDetailsType | TagDetailsType)[]) {
    const table = type == "tag" ? allTagsTable : allModesTable;

    // Get current
    const currentItems = await drizzle(env.DB).select().from(table);



    // Get new items
    const newItems = items.filter(m => !currentItems.find(cm => cm.id === m.id));

    // Add new items to db
    if (newItems.length > 0) {
        console.log("Adding items: ", newItems.map((item) => item.name));
        await drizzle(env.DB).insert(table).values(newItems);
        await insertVectors(env, type, newItems);
    }


    // Get edited items
    const editedItems = items.filter(m => {
        const current = currentItems.find(cm => cm.id === m.id);
        if (newItems.includes(m)) return false;
        return !_.isEqual(current, m);
    });

    // Update edited items
    for (const item of editedItems) {
        console.log("Updating item: ", item.name);
        await drizzle(env.DB).update(table).set(item).where(eq(table.id, item.id));
    }
    if (editedItems.length > 0 ) await insertVectors(env, type, editedItems);

    // Get deleted items
    const deletedItems = currentItems.filter(m => !items.find(bm => bm.id === m.id));

    // Delete items in db
    for (const item of deletedItems) {
        console.log("Deleting item: ", item.name);
        await drizzle(env.DB).delete(table).where(eq(table.id, item.id));
    }
    if (deletedItems.length > 0 ) await (type == "tag" ? env.VEC_TAGS : env.VEC_MODES).deleteByIds(deletedItems.map((item) => item.id));

}



export async function insertVectors(env: any, type: "tag" | "mode", items: (ModeDetailsType | TagDetailsType)[]) {
    const { data: embeddings } = await env.AI.run(
        "@cf/baai/bge-base-en-v1.5",
        {
            text: items.map((item) =>
                item.name + ".  " + item.desc + ".  " + (item.aka as string[]).join(", ")
            )
        }
    );

    const vectors = items.map((item, i) => ({
        id: item.id,
        values: embeddings[i],
        namespace: 'modeId' in item ? item.modeId : undefined // Mode ID to filter tags (if undefined its a tag so just set to undefined)
    }));

    await (type == "tag" ? env.VEC_TAGS : env.VEC_MODES).upsert(vectors)
}