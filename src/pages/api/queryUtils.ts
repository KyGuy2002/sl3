import { allModesTable, allTagsTable, embedCache } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function runTypeaheadFtsQuery(env: any, type: "tags" | "modes", query: string, modeId?: string) {
    if (type == "tags" && modeId == undefined) throw new Error("modeId is required for tags");
    const DB_TABLE = type == "tags" ? "all_tags_fts" : "all_modes_fts";

    let newQuery = query.replace(" ", " + ");
    newQuery = `name:^${newQuery}* OR aka:${newQuery}*`;

    // Start of name match
    let res = await env.DB.prepare(`SELECT *, bm25(${DB_TABLE},3,1,2,0,0,0,0,0,0) as bm25, snippet(${DB_TABLE}, -1, '', '', '',32) FROM ${DB_TABLE} WHERE ${DB_TABLE} MATCH ? AND bm25 < 0 ORDER BY bm25 LIMIT 1`).bind(newQuery).run();
    res = res.results[0];
    if (!res) return undefined;

    const lastKey: string = Object.keys(res)[Object.keys(res).length - 1];
    let value = res[lastKey];

    if (res.aka == value) {
        const json = JSON.parse(value);
        json.forEach((element: any) => {
            console.log(element, query)
            if (!element.toLowerCase().startsWith(query.toLowerCase())) return;
            console.log("Found aka!: " + element)
            value = element;
        });
    }

    return value;
}


export async function runFtsQuery(env: any, type: "tags" | "modes", query: string, searchType: "exact" | "or", modeId?: string) {
    const DB_TABLE = type == "tags" ? "all_tags_fts" : "all_modes_fts";

    // Exact match.  Rank: name, aka, desc (name most important)
    query = query.replaceAll("\"", "\"\""); // Escape quotes (SQL Style)
    if (searchType == "or") query = query.split(" ").join("\" OR \""); // Split words into OR and add quotes
    query = "\"" + query + "\""; // Add quotes to start and end    

    const res = await env.DB.prepare(
        `SELECT *, bm25(${DB_TABLE},3,1,2,0,0,0,0,0,0) as bm25 FROM ${DB_TABLE} WHERE ${DB_TABLE} MATCH ? ${(modeId ? `AND modeId = ?` : ``)} AND bm25 < 0 ORDER BY bm25`
    ).bind(query, ...(modeId ? [modeId] : [])).run();

    // Parse aka json (since not drizzle)
    for (const r of res.results) {
        if (r.aka) {
            r.aka = JSON.parse(r.aka);
        }
    }

    return res.results;
}


export async function runQuery(env: any, type: "tags" | "modes", query: string, modeId?: string) {
    const VEC_TABLE = type == "tags" ? env.VEC_TAGS : env.VEC_MODES;
    const DB_TABLE = type == "tags" ? allTagsTable : allModesTable;


    // Get embedding
    let embedTs = Date.now();
    const { vector, cached } = await getOrGenEmbed(env, query);
    embedTs = Date.now() - embedTs;


    // Find matches in db
    let vecTs = Date.now();
    const nearest = await VEC_TABLE.query(
        vector,
        {
            topK: 25,
            returnValues: false,
            namespace: modeId // Is undefined if modes, so wont filter at all
        }
    )
    vecTs = Date.now() - vecTs;


    const q: any[] = nearest.matches.map((match: any) => eq(DB_TABLE.id, match.id));

    // Get full data
    let dataTs = Date.now();
    const res = await drizzle(env.DB)
        .select()
        .from(DB_TABLE)
        .where(
            or(...q)
        );
        dataTs = Date.now() - dataTs;

    
    // Combine to one array
    // NOTE: Must loop from matches to keep order
    const res2 = [];
    for (const item of nearest.matches) {
        const db = res.find((r: any) => r.id === item.id)
        if (!db) continue; // Vector index can be out of sync with db (lag after update or something)
        res2.push({
            ...item,
            ...db
        });
    }


    const maxScore = Math.max(...res2.map(item => item.score));
    const minScore = Math.min(...res2.map(item => item.score));


    // Find the item with the biggest jump in score to the next one, but not including the second half of the list
    let biggestJump = 0;
    let biggestJumpIndex = 0;
    for (let i = 0; i < res2.length / 2; i++) {
        const jump = res2[i].score - res2[i + 1].score;
        if (jump > biggestJump) {
            biggestJump = jump;
            biggestJumpIndex = i;
        }
    }

    // Split the list at the biggest jump
    const bestItems = res2.slice(0, biggestJumpIndex + 1);

    const final: any = {};
    // Highlight a few items at the top, but still show maybe items
    if (bestItems.length < 5) {
        const maybeItems = res2.slice(biggestJumpIndex + 1);

        final.mode = "best";
        final.bestItems = bestItems;
        final.items = [];
        final.maybeItems = maybeItems;
    }
    // Display error to user, but still show all items
    else if (maxScore - minScore < 0.11) {
        final.mode = "bad";
        final.bestItems = [];
        final.items = [];
        final.maybeItems = res2;
    }
    // Display one list of all items
    else {
        final.mode = "normal";
        final.bestItems = [];
        final.items = res2;
        final.maybeItems = [];
    }

    return {
        ...final,
        count: res2.length,
        times: {
            embed: embedTs,
            vec: vecTs,
            data: dataTs,
            total: embedTs + vecTs + dataTs
        },
        cached: cached
    };

}



export async function getOrGenEmbed(env: any, query: string) {

    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(query));

    const hRes = await drizzle(env.DB)
        .select()
        .from(embedCache)
        .where(
            eq(embedCache.hash, new TextDecoder().decode(hash))
        )
    
    if (hRes.length == 0) {

        const e = await genEmbed(query, env);

        try {
            await drizzle(env.DB)
            .insert(embedCache)
            .values({
                hash: new TextDecoder().decode(hash),
                vector: e
            })
            .execute();
        } catch (error: any) {
            // Sometimes the hash was added after the first check
            if (error.message != "D1_ERROR: UNIQUE constraint failed: embed_cache.hash: SQLITE_CONSTRAINT")
                throw error;
        }

        return { vector: e, cached: false };

    }

    else return { vector: hRes[0].vector, cached: true };

}


async function genEmbed(query: string, env: any) {
    const { data: embeddings } = await env.AI.run(
        "@cf/baai/bge-base-en-v1.5",
        {
            text: query
        }
    );
    return embeddings[0];
}