import { allModesTable, allTagsTable, foreignModeMap, foreignTagMap } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import _ from "lodash";


export async function GET({ params, request, locals }: APIContext) {

    const res = await drizzle(locals.runtime.env.DB).select().from(foreignTagMap);
    const res2 = await drizzle(locals.runtime.env.DB).select().from(foreignModeMap);

    const all = [...res, ...res2];

    const obj: any = {};
    for (const item of all) {
        if (!obj[item.website]) obj[item.website] = {};
        obj[item.website][item.theirId] = item.ourId;
    }

    return new Response(JSON.stringify(obj))

}


export async function POST({ params, request, locals }: APIContext) {
    const body: any = await request.json();

    // Get current
    const tagRes = await drizzle(locals.runtime.env.DB).select().from(allTagsTable);
    const modeRes = await drizzle(locals.runtime.env.DB).select().from(allModesTable);

    const newTagMap = [];
    const newModeMap = [];

    // TODO allow delete mapping

    // Seperate into tags and modes
    for (const site of Object.keys(body)) {
        for (const theirId of Object.keys(body[site])) {
            const ourId = body[site][theirId];

            // OurId exists in allTags
            if (tagRes.find((x) => x.id == ourId)) newTagMap.push({ website: site, theirId, ourId });

            // OurId exists in allModes
            else if (modeRes.find((x) => x.id == ourId)) newModeMap.push({ website: site, theirId, ourId });

            else throw new Error(`OurId ${ourId} does not exist in allTags or allModes!`);

        }
    }

    // Note: the length checker is only needed when the db is completely empty the first time.

    // Delete all
    if (newModeMap.length > 0) await drizzle(locals.runtime.env.DB).delete(foreignModeMap);
    if (newTagMap.length > 0) await drizzle(locals.runtime.env.DB).delete(foreignTagMap);

    // Insert new
    if (newModeMap.length > 0) await drizzle(locals.runtime.env.DB).insert(foreignModeMap).values(newModeMap);
    if (newTagMap.length > 0) await drizzle(locals.runtime.env.DB).insert(foreignTagMap).values(newTagMap);

    return new Response("Success!");

}