import { runFtsQuery } from "@/pages/api/queryUtils";
import { getNearestId } from "../utils";


/**
 * Gets items found using FTS.
 * @returns (Potential duplicates) item ids and some data.
 */
export async function getItemIdsFromRawsFts(env: any, parseForType: "tag" | "mode", rawItems: string[]) {


    // Find matches in db (concurrently)
    const promises = [];
    for (const item of rawItems) {

        promises.push(runFtsQuery(env, (parseForType == "tag" ? "tags" : "modes"), item));

    }
    const resp = await Promise.all(promises);

    
    // Clean up
    const possible: any[] = [];
    for (let item of resp) {
        if (item.length == 0) continue; // No results for this raw item
        possible.push(item[0]);
    }
    
    return possible;

}


/**
 * Gets items found using AI Embedding.
 * @returns (Potential duplicates) item ids.
 */
export async function getItemIdsFromRawsEmbed(env: any, parseForType: "tag" | "mode", rawItems: string[]) {
    console.log(rawItems)


    // Find matches in db (concurrently)
    const promises = [];
    for (const item of rawItems) {

        promises.push(getNearestId(env, parseForType, item, 1, "precise"));

    }
    const resp = await Promise.all(promises);
    

    // Filter out low scores and clean up
    const possible: any[] = [];
    for (let item of resp) {

        // Skip if score too low
        if (item[0].score < 0.8) continue;

        possible.push(item[0]);
    }
    
    return possible;

}