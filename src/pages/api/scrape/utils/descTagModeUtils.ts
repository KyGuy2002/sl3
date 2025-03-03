import { eq, or } from "drizzle-orm";
import { getNearestId } from "./utils";
import { allModesTable, allTagsTable } from "@/db/schema";
import { drizzle } from "drizzle-orm/d1";



/**
 * Uses LLM to get a string list of RAW features/gamemodes from a server description.
 * These are NOT our tags/modes, but raw data that we will use to find our tags/modes.
 * It also gets links and email addresses.
 */
async function extractRawItemsFromDesc(env: any, desc: string): Promise<{ features: string[], links: string[], emails: string[] }> {
    
    const response = await env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
        messages: [
            {
                role: "system",
                content: "Extract data about a minecraft server from a description.  The extracted features and gamemodes should be short and too the point, no fluff.  1-3 words each."
            },
            {
                role: "user",
                content: desc
            }
        ],
        response_format: {
            "type": "json_schema",
            "json_schema": {
                "type": "object",
                "properties": {
                    "features": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        }
                    },
                    "gamemodes": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        }
                    },
                    "links": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "email_addresses": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                },
                "required": []
            }
        }
    });

    const comb = [ ...response.response.features, ...response.response.gamemodes ];

    // Remove duplicates
    response.response.features = comb.filter((item, index) => comb.indexOf(item) === index);

    return {
        features: comb,
        links: response.response.links,
        emails: response.response.email_addresses
    };

}


/**
 * Finds matching tags or modes from a raw item.
 * @param env 
 * @param parseForType tag or mode
 * @param rawItems raw feature/gamemode keyword strings (usually from LLM)
 */
async function getItemsFromRaws(env: any, parseForType: "tag" | "mode", rawItems: string[]) {
    const table = parseForType == "tag" ? allTagsTable : allModesTable;


    // Find matches in db (concurrently)
    const promises = [];
    for (const item of rawItems) {
        promises.push(getNearestId(env, parseForType, item, 1));
    }
    const resp = await Promise.all(promises);

    
    // Filter out low scores and duplicates
    const possible: any[] = [];
    for (let item of resp) {
        item = item[0];

        // Skip if score too low
        if (item.score < 0.8) continue;

        // Skip if already in possible
        if (possible.find((t) => t.id == item.id)) continue;

        possible.push(item);
    }


    if (possible.length == 0) return [];


    // Get full data
    const ors = possible.map((t) => eq(table.id, t.id));

    const res = await drizzle(env.DB)
        .select()
        .from(table)
        .where(
            or(...ors)
        );
    
    
    // Combine scores with data
    for (const item of res) {
        const match = possible.find((t) => t.id == item.id);
        item.score = match.score;
    }
    
    return res;

}


/**
 * Gets tags and modes from a raw server description.
 */
export async function getTagsModesFromDesc(env: any, desc: string) {
    
    const { features } = await extractRawItemsFromDesc(env, desc);

    console.log(features);
    
    const tagsP = getItemsFromRaws(env, "tag", features);
    const modesP = getItemsFromRaws(env, "mode", features);

    const [ tags, modes ] = await Promise.all([tagsP, modesP]);

    // TODO skip tags that done have a mode?
    // TODO add modes if we have a tag?

    return { tags: tags, modes: modes };

}