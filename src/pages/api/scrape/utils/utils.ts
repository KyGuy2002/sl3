import { getOrGenEmbed, runFtsQuery } from "../../queryUtils";
import { chunk } from 'llm-chunk';


// TODO preset some mappings from foreign to our tags (maybe do it the specific site adapter/utils?)
export async function getMatchingMode(env: any, foreignModeName: string, foreignModeDesc?: string) {

    const ftsRes = await runFtsQuery(env, "modes", foreignModeName + foreignModeDesc);
    
    // TODO add vector embedding into this as well

    if (ftsRes.length == 0) return null;
    return ftsRes[0];

}


// TODO preset some mappings from foreign to our tags (maybe do it the specific site adapter/utils?)
export async function getTagsFromDesc(env: any, modeId: string, desc: string, foreignTags: { name: string, desc?: string }[]) {


    // Split desc into chunks
    // const chunks = chunk(desc, {
    //     minLength: 0,          // number of minimum characters into chunk
    //     maxLength: 16,       // number of maximum characters into chunk
    //     splitter: "sentence", // paragraph | sentence
    //     overlap: 4,            // number of overlap chracters
    //     delimiters: ""         // regex for base split method
    // });

    const chunks = await parseWithLLM(env, desc);


    if (chunks.length > 15) throw new Error("Too many chunks.");


    const ids: string[] = [];


    chunks.forEach(async (c: string) => {

        // Get embedding
        const { vector, cached } = await getOrGenEmbed(env, c);


        // Find matches in db
        const nearest = await env.VEC_TAGS.query(
            vector,
            {
                topK: 1,
                returnValues: false,
                namespace: modeId
            }
        )

        ids.push(nearest.matches[0].id);

    });


    // Remove duplicates
    const uniqueIds = [...new Set(ids)];

    return uniqueIds;


}


async function parseWithLLM(env: any, desc: string) {

    const answer = await env.AI.run('@hf/thebloke/deepseek-coder-6.7b-instruct-awq', {
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: desc,
            }
        ]
    });

    const json = JSON.parse(answer.results[0].content);

    return json;

}


const systemPrompt = "You are parsing a minecraft server description to find tags. Tags should be 1-2 words long. Max 15 tags Tags should describe a specific feature, plugin, gamemode, style, or anything else that users may be trying to filter a server list by. Tags do not need to be exact text from the input, but they should sum up the different things to do on the server. If you can't find anything, DO NOT MAKE TAGS UP. Just return nothing. Tags should be in a JSON array with each tag surrounded by double quotes. Do NOT include more than one of each tag. Do NOT use mood words like relaxed or intense. Instead describe the features and gameplay.";