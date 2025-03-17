
import { drizzle } from "drizzle-orm/d1";
import { allModesTable, allTagsTable, foreignTagMap } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import type { ModeDetailsType, TagDetailsType } from "@/pages/api/server/utils";



/**
 * Gets the corresponding local tag and/or mode for the specified foreign tag id.
 * @param foreignId Id of the foreign tag
 * @param site Name of the foreign site
 */
export default async function getMappedTag(env: any, foreignId: string, site: string): Promise<MappedTagType[] | undefined> {
    const res = await drizzle(env.DB).select().from(foreignTagMap)
        .leftJoin(allTagsTable, eq(foreignTagMap.ourId, allTagsTable.id))
        .innerJoin(allModesTable, or(
            eq(allTagsTable.modeId, allModesTable.id),
            eq(foreignTagMap.ourId, allModesTable.id)
        ))
        .where(and(
            eq(foreignTagMap.theirId, foreignId),
            eq(foreignTagMap.website, site)
        ));
    
    if (res.length == 0) return undefined;

    const items: MappedTagType[] = [];

    for (const item of res) {

        const modeDetails: ModeDetailsType = {
            id: item.all_modes.id,
            name: item.all_modes.name,
            desc: item.all_modes.desc,
            aka: item.all_modes.aka as string[],
        }
        
        // Is a mode
        if (item.all_tags == null) {
            if (res.length > 1) console.log("ERROR: Multiple modes for foreign tag id", foreignId, "on site", site, "This should not happen!");
            items.push({
                isMode: true,
                modeDetails: modeDetails
            });
        }
    
        // Is a tag
        else {
    
            const tagDetails: TagDetailsType = {
                modeId: modeDetails.id,
                id: item.all_tags.id,
                name: item.all_tags.name,
                desc: item.all_tags.desc,
                type: item.all_tags.type,
                aka: item.all_tags.aka as string[],
            }
    
            items.push({
                isAmbiguous: res.length > 1,
                isMode: false,
                tagDetails: tagDetails,
                modeDetails: modeDetails
            });
        }

    }


    return items;


    
}


// There can be multiple tags but not multiple modes.
export type MappedTagType = {
    isMode: true,
    modeDetails: ModeDetailsType
} | {
    isAmbiguous?: boolean,
    isMode: false,
    tagDetails: TagDetailsType,
    modeDetails: ModeDetailsType
};