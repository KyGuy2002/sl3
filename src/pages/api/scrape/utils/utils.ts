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

    // Remove invalid links
    links = links.filter((link) => link.url.includes("."));

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
 * Gets the n nearest matching tags or modes to the input string.
 * Uses AI embeddings
 * @param type tag or mode
 * @param input Input string
 * @param count How many to return
 */
export async function getNearestId(env: any, type: "tag" | "mode", input: string, count: number, accuracy: "precise" | "fast") {
    const idx = type == "tag" ? env.VEC_TAGS : env.VEC_MODES;

    // Get embedding
    const { vector } = await getOrGenEmbed(env, input);
    
    
    // Find matches in db
    const nearest = await idx.query(
        vector,
        {
            topK: count,
            returnValues: (accuracy == "precise"), // returnValues: true is more accurate match but slower
        }
    )

    const res = [];
    for (const match of nearest.matches) {
        res.push({
            id: match.id,
            score: match.score,
            modeId: match.namespace
        });
    }

    return res;

}