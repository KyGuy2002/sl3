import { allModesTable, allTagsTable, foreignModeMap, foreignTagMap } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import _ from "lodash";


export async function GET({ params, request, locals }: APIContext) {

    const res = await drizzle(locals.runtime.env.DB).select().from(foreignTagMap);

    const obj: any = {};
    for (const item of res) {
        if (!obj[item.website]) obj[item.website] = {};
        obj[item.website][item.theirId] = item.ourId;
    }

    return new Response(JSON.stringify(obj))

}


export async function POST({ params, request, locals }: APIContext) {
    const body: any = await request.json();

    const newTagMap = [];

    // TODO allow delete mapping

    // Seperate into tags and modes
    for (const site of Object.keys(body)) {
        for (const theirId of Object.keys(body[site])) {
            const ourId = body[site][theirId];

            newTagMap.push({ website: site, theirId, ourId });

        }
    }

    // Note: the length checker is only needed when the db is completely empty the first time.
    if (newTagMap.length == 0) return new Response("Success!");

    // Delete all
    await drizzle(locals.runtime.env.DB).delete(foreignTagMap);

    // Insert new
    // Batches of 15
    for (let i = 0; i < newTagMap.length; i += 15) {
        await drizzle(locals.runtime.env.DB).insert(foreignTagMap).values(newTagMap.slice(i, i + 15));
    }

    return new Response("Success!");

}