import { allModesTable, allTagsTable, foreignModeMap, foreignTagMap } from "@/db/schema";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import _ from "lodash";
import type { ModeDetailsType, TagDetailsType } from "../../server/utils";


export async function GET({ params, request, locals }: APIContext) {

    let foreign: { id: string, name: string, description?: string }[];
    switch (params.site) {
        case "findmcserver.com": {
            foreign = await fetch('https://findmcserver.com/api/tags?type=KEYWORD').then(r => r.json());
            break;
        }
        default: return new Response("Invalid site", { status: 400 });
    }



    const [ tagRes, modeRes ] = await drizzle(locals.runtime.env.DB).batch([

        drizzle(locals.runtime.env.DB).select()
            .from(foreignTagMap)
            .innerJoin(allTagsTable, eq(foreignTagMap.ourId, allTagsTable.id))
            .where(eq(foreignTagMap.website, params.site)),


        drizzle(locals.runtime.env.DB).select()
            .from(foreignModeMap)
            .innerJoin(allModesTable, eq(foreignModeMap.ourId, allModesTable.id))
            .where(eq(foreignModeMap.website, params.site)),

    ])

    const final: any = [];
    for (const item of foreign) {
        // Each item can have multiple tags or one mode associated.

        const items = [];
        let mapType = "unknown";
        for (const t of modeRes) {
            if (t.foreign_mode_map.theirId == item.id) {
                mapType == "mode";
                items.push(t.all_modes);
            }
        }
        for (const t of tagRes) {
            if (t.foreign_tag_map.theirId == item.id) {
                mapType = "tags";
                items.push(t.all_tags);
            }
        }

        final.push({
            id: item.id,
            name: item.name,
            description: item.description,
            mapType: mapType,
            items: items
        })

    }

    return new Response(JSON.stringify(final))

}


export type MappingType = {
    id: string,
    name: string,
    description: string,
    items: TagDetailsType[] | ModeDetailsType[] // Modes can only have 1, but is an array for simplicity
}


export async function POST({ params, request, locals }: APIContext) {
    const body: any = await request.json();

    const newTagMap = [];
    const newModeMap = [];

    // Seperate into tags and modes
    for (const mapping of body) {
        if (mapping.items.length == 0) continue;
        
        // Is a tag
        if (mapping.items[0].modeId) {
            for (const tag of mapping.items) {
                newTagMap.push({
                    ourId: tag.id,
                    theirId: mapping.id,
                    website: params.site!
                })
            }
        }

        // Is a mode
        else {
            newModeMap.push({
                ourId: mapping.items[0].id,
                theirId: mapping.id,
                website: params.site!
            })
        }

    }

    // Delete all
    await drizzle(locals.runtime.env.DB).delete(foreignTagMap).where(eq(foreignTagMap.website, params.site!));
    await drizzle(locals.runtime.env.DB).delete(foreignModeMap).where(eq(foreignModeMap.website, params.site!));

    // Insert new
    // Batches of 15
    for (let i = 0; i < newTagMap.length; i += 15) {
        await drizzle(locals.runtime.env.DB).insert(foreignTagMap).values(newTagMap.slice(i, i + 15));
    }
    for (let i = 0; i < newModeMap.length; i += 15) {
        await drizzle(locals.runtime.env.DB).insert(foreignModeMap).values(newModeMap.slice(i, i + 15));
    }

    return new Response("Success!");

}