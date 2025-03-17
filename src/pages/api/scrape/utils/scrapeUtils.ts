import { drizzle } from "drizzle-orm/d1";
import type { ModeDetailsType, ServerLinkType, TagDetailsType } from "../../server/utils";
import { getDetailsFromDescLlm } from "./processingUtils/getDetailsFromDescLlm";
import getMappedTag, { type MappedTagType } from "./processingUtils/getMappedTag";
import { allModesTable } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { getItemIdsFromRawsEmbed, getItemIdsFromRawsFts } from "./processingUtils/getItemsFromDesc";
import genShortDescLlm from "./processingUtils/genShortDescLlm";



export default async function extractItemsFromDesc(env: any, desc: string, site: string, foreignTagIds: string[]) {
    console.log("1")
    let promises = [];

    // Get mapped items
    promises.push(getMappedItems(env, site, foreignTagIds)); // Out: all details

    // Get details from LLM
    promises.push(getDetailsFromDescLlm(env, desc)); // Out-modes: mode names

    // Execute
    const [ mappedItems, llmDetails ] = await Promise.all<[MappedTagType[], any]>(promises);
    promises = [];

    console.log("2")


    // Get all for-sure gamemodes from LLM
    promises.push((async () => {
        const ors = llmDetails.ourModeNames.map((mode: string) => eq(allModesTable.name, mode));
        const llmModes = await drizzle(env.DB).select().from(allModesTable).where(or(...ors));
        return llmModes;
    })());

    // Get embedded tags from llm feature summary 
    promises.push(getItemIdsFromRawsEmbed(env, "tag", llmDetails.rawFeatures));
    promises.push(getItemIdsFromRawsFts(env, "tag", llmDetails.rawFeatures));

    // Execute
    const [ llmModes, embedTags, ftsTags ] = await Promise.all<[any, any, any]>(promises);

    console.log("3")


    // Get all for-sure gamemodes from mapped items
    const mappedModes: ModeDetailsType[] = [];
    for (const item of mappedItems) {
        if (item.isMode) { // Modes
            mappedModes.push(item.modeDetails);
        }

        else if (!item.isMode && !item.isAmbiguous) { // Parent modes for non-ambiguous tags
            mappedModes.push(item.modeDetails);
        }
    }

    console.log("4")

    // Combine llmModes with mappedModes
    for (const mode of llmModes) {
        if (mappedModes.find((m) => m.id == mode.id)) continue;
        mappedModes.push(mode);
    }

    console.log("5")

    // Get all tags from mapped items
    const mappedTags: TagDetailsType[] = [];
    for (const item of mappedItems) {
        if (item.isMode) continue;

        if (!item.isAmbiguous) { // Non-ambiguous tags
            mappedTags.push(item.tagDetails);
        }

        else if (item.isAmbiguous && mappedModes.includes(item.modeDetails)) { // Ambiguous tags where we already have parent mode (from map or llm)
            mappedTags.push(item.tagDetails);
        }
    }

    console.log("6")
    
    const featureTags = ftsTags.concat(embedTags);

    // Remove duplicates and ones without a parent mode
    for (const tag of featureTags) {

        // Remove if we dont already have the parent mode.  This is to try to prevent adding ambiguous tags that we dont have a mode for.
        if (!mappedModes.filter((m) => m.id == tag.modeId).length) continue;

        // Remove if we already have it
        if (mappedTags.filter((m) => m.id == tag.id).length) continue;

        mappedTags.push(tag);
    }

    console.log("7")



    // Generate short descriptions for each mode
    const descRes = await genShortDescLlm(env, desc, mappedModes);

    console.log("8")

    // Process Links
    const links = [];
    for (const link of llmDetails.links) {
        links.push(processLink(link));
    }
    for (const email of llmDetails.emails) {
        links.push({
            type: "EMAIL",
            url: email
        });
    }

    console.log("9")


    return {
        links: links, // May have duplicates
        modes: mappedModes,
        tags: mappedTags,
        cardDescs: descRes
    }


}



function processLink(link: string): ServerLinkType {
    let type = "WEBSITE";

    // TODO make this more robust
    if (link.includes("discord.gg/")) type = "DISCORD";
    else if (link.includes("twitter.com/") || link.includes("x.com/")) type = "TWITTER";
    else if (link.includes("instagram.com/")) type = "INSTAGRAM";
    else if (link.includes("youtube.com/") || link.includes("youtu.be/")) type = "YOUTUBE";
    else if (link.includes("tiktok.com/")) type = "TIKTOK";
    else if (link.includes("facebook.com/")) type = "FACEBOOK";
    else if (link.includes("twitch.tv/")) type = "TWITCH";
    else if (link.includes("patreon.com/")) type = "PATREON";
    else if (link.includes("store.")) type = "STORE";
    else if (link.includes("bluesky.")) type = "BLUESKY";

    // TODO move cleanup to here instead of frontend (add https, add mailto, etc)

    return {
        type: type,
        url: link
    }
}



/**
 * Gets all possible tags and modes found using preset mappings from foreign tags.
 */
async function getMappedItems(env: any, site: string, foreignTagIds: string[]): Promise<MappedTagType[]> {

    const promises: Promise<MappedTagType[] | undefined>[] = [];
    for (const id of foreignTagIds) {
        const mapped = getMappedTag(env, id, site);
        promises.push(mapped);
    }

    const res = await Promise.all(promises);

    const items: MappedTagType[] = [];
    for (const item of res) {
        if (item) items.push(...item);
    }

    return items;
}