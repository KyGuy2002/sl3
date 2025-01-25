import { allModesTable, allTagsTable, embedCache, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { eq, min, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {

    const query = new URL(request.url).searchParams.get("q");
    if (query === null) return new Response("No query provided", { status: 400 });
    const modeId = new URL(request.url).searchParams.get("modeId");
    if (modeId === null) return new Response("No modeId provided", { status: 400 });


    // Get embedding
    let embedTs = Date.now();
    const { vector, cached } = await getOrGenEmbed(query, modeId, locals.runtime.env);
    embedTs = Date.now() - embedTs;


    // Find matches in db
    let vecTs = Date.now();
    const nearest = await locals.runtime.env.VEC_TAGS.query(
        vector,
        {
            topK: 25,
            returnValues: false,
            namespace: modeId
        }
    )
    vecTs = Date.now() - vecTs;


    const q: any[] = nearest.matches.map((match: any) => eq(allTagsTable.id, match.id));

    // Get full data
    let dataTs = Date.now();
    const res = await drizzle(locals.runtime.env.DB)
        .select()
        .from(allTagsTable)
        .where(
            or(...q)
        );
        dataTs = Date.now() - dataTs;

    
    // Combine to one array
    const res2 = nearest.matches.map((match: any) => ({
        id: match.id,
        score: match.score,
        ...res.find((r: any) => r.id === match.id)
    }));


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

    return new Response(JSON.stringify({
        ...final,
        count: res2.length,
        times: {
            embed: embedTs,
            vec: vecTs,
            data: dataTs,
            total: embedTs + vecTs + dataTs
        },
        cached: cached
    }));


  
    // // Calculate the threshold for "best" items (90% of the max score)
    // const threshold = maxScore * 0.85;
    
    // // Separate items into "best" and "maybe" arrays based on the threshold
    // const bestItems = res2.filter(item => item.score >= threshold);
    // const maybeItems = res2.filter(item => item.score < threshold); 

    // console.log((cached ? "Cached" : "Fresh"), "- Time: " + (embedTs + vecTs + dataTs) / 1000 + "s");
    // return new Response(JSON.stringify({
    //     items: (bestItems.length <= 5 ? bestItems : res2), // Only group if 5 or less best, otherwise it is kinda meaningless
    //     otherItems: (bestItems.length <= 5 ? maybeItems : []),
    //     badResults: (maxScore - minScore < 0.15),
    //     times: {
    //         embed: embedTs,
    //         vec: vecTs,
    //         data: dataTs,
    //         total: embedTs + vecTs + dataTs
    //     },
    //     cached: cached
    // }));

}



async function getOrGenEmbed(query: string, modeId: string, env: any) {

    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(modeId + query));

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