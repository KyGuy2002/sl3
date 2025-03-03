import type { ModeDetailsType, ServerLinkType, ServerModeTagType, ServerModeType } from "../../server/utils";
import { drizzle } from "drizzle-orm/d1";
import { allModesTable, allTagsTable, foreignTagMap } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { getOrGenEmbed } from "../../queryUtils";



/**
 * Compares links, ignoring scheme, www, and trailing slashes
 */
export function linksSame(a: string | undefined, b: string | undefined) {
    if (!a || !b) return false;
    const clean = (url: string) => url.replace(/(^\w+:|^)\/\//, '').replace("www.", "").replace(/\/$/, "");
    return clean(a) == clean(b);
}



/**
 * Combines and removes duplicate links after scraping.
 */
export function cleanupLinks(links: ServerLinkType[]): ServerLinkType[] {

    // Remove duplicates
    links = links.filter((link, index, self) =>
        index === self.findIndex((t) => (
            linksSame(t.url, link.url)
        ))
    )

    // TODO what if duplicate links of same type with different url?

    // If store and patreon are the same, remove patreon.
    if (linksSame(links.find((l) => l.type === "STORE")?.url, links.find((l) => l.type === "PATREON")?.url)) {
        links.splice(links.findIndex((l) => l.type === "PATREON"), 1);
    }

    // If there is a patreon but not a store, change patreon to store. (Otherwise leave seperate)
    if (links.find((l) => l.type === "PATREON") && !links.find((l) => l.type === "STORE")) {
        links.find((l) => l.type === "PATREON")!.type = "STORE";
    }

    return links;
}



/**
 * Conditionally concatenates the port to the address if it is not the default port.
 */
export function concatPort(platform: "bedrock" | "java", address: string | undefined, port: number | undefined) {
    if (port && port != (platform == "bedrock" ? 19132 : 25565)) return address?.toLowerCase() + ":" + port;
    else return address?.toLowerCase();
}



/**
 * Gets the corresponding local tag and/or mode for the specified foreign tag id.
 * @param foreignId Id of the foreign tag
 * @param site Name of the foreign site
 */
async function getMappedTag(env: any, foreignId: string, site: string) {
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

    const modeDetails: ModeDetailsType = {
        id: res[0].all_modes.id,
        name: res[0].all_modes.name,
        desc: res[0].all_modes.desc,
        aka: res[0].all_modes.aka as string[],
    }
    
    // Is a mode
    if (res[0].all_tags == null) return {
        isMode: true,
        modeDetails: modeDetails
    }

    // Is a tag
    else return {
        isMode: false,
        tagDetails: {
            modeId: modeDetails.id,
            id: res[0].all_tags.id,
            name: res[0].all_tags.name,
            desc: res[0].all_tags.desc,
            type: res[0].all_tags.type,
            aka: res[0].all_tags.aka as string[],
        },
        modeDetails: modeDetails
    }
}



/**
 * Adds a mode and/or tag corresponding to the foreign id if it is mapped.
 * @param serverModes Existing serverModes array
 * @param serverId Our server id to add into the serverModes array
 * @param foreignId Id of the tag on the foreign site
 * @param site Name of the foreign site
 */
export async function addIfMapped(env: any, serverModes: ServerModeType[], serverId: string, foreignId: string, site: string) {
    // Get from map
    const ourTag = await getMappedTag(env, foreignId, site);
    if (!ourTag) return false;

    // Create new mode
    if (!serverModes.find((m: ServerModeType) => m.modeId == ourTag.modeDetails.id)) {
        serverModes.push({
            serverId: serverId,
            modeId: ourTag.modeDetails.id,
            details: ourTag.modeDetails,
            cardDesc: "TODO need desc",
            fullDesc: "TODO need desc",
            tags: [],
        });
    }

    // Add tag to mode (if its a tag, and not already present [foreign tag mappings can point to the same tag])
    const currentTags = serverModes.find((m: any) => m.modeId == ourTag.modeDetails.id)!.tags;
    if (!ourTag.isMode && !currentTags.find((t: ServerModeTagType) => t.tagId == ourTag.tagDetails!.id)) {
        currentTags.push({
            serverId: serverId,
            modeId: ourTag.modeDetails.id,
            tagId: ourTag.tagDetails!.id,
            details: ourTag.tagDetails!
        });
    }

    return true;
}


/**
 * Gets the n nearest matching tags or modes to the input string.
 * Uses AI embeddings
 * @param type tag or mode
 * @param input Input string
 * @param count How many to return
 */
export async function getNearestId(env: any, type: "tag" | "mode", input: string, count: number) {
    const idx = type == "tag" ? env.VEC_TAGS : env.VEC_MODES;

    // Get embedding
    const { vector } = await getOrGenEmbed(env, input);
    
    
    // Find matches in db
    const nearest = await idx.query(
        vector,
        {
            topK: count,
            returnValues: false,
        }
    )

    return nearest.matches;

}