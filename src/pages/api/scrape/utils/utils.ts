import { getOrGenEmbed, runFtsQuery } from "../../queryUtils";
import { chunk } from 'llm-chunk';


// TODO preset some mappings from foreign to our tags (maybe do it the specific site adapter/utils?)
export async function getMatchingMode(env: any, foreignModeName: string, foreignModeDesc?: string) {

    const ftsRes = await runFtsQuery(env, "modes", (foreignModeName + " " + foreignModeDesc));
    
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

    const chunks = await getServerTagsLLM(env, desc);


    if (chunks.length > 15) throw new Error("Too many chunks.");


    const ids: string[] = [];


    for (const c of chunks) {

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

    };


    // Remove duplicates
    const uniqueIds = [...new Set(ids)];

    return uniqueIds;


}


async function getServerTagsLLM(env: any, desc: string) {

    const answer = await env.AI.run('@hf/meta-llama/meta-llama-3-8b-instruct', {
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

    answer.response = answer.response.replaceAll("\n", "");
    console.log(answer.response)
    const json = await JSON.parse(answer.response);

    return json;

}


const systemPrompt = "You are parsing a minecraft server description to find tags. Tags should be 1-2 words long. Max 15 tags Tags should describe a specific feature, plugin, gamemode, style, or anything else that users may be trying to filter a server list by. Tags do not need to be exact text from the input, but they should sum up the different things to do on the server. If you can't find anything, DO NOT MAKE TAGS UP. Just return nothing. Tags should be in a JSON array with each tag surrounded by double quotes. Do NOT include more than one of each tag. Do NOT use mood words like relaxed or intense. Instead describe the features and gameplay.  Output ONLY valid JSON.  No other text response is needed.";


export async function getServerShortDesc(env: any, desc: string, mode: { name: string, desc: string }) {

    const answer = await env.AI.run('@hf/meta-llama/meta-llama-3-8b-instruct', {
        messages: [
            {
                role: 'system',
                content: descPrompt.replace("{{MODE}}", mode.name + ": " + mode.desc),
            },
            {
                role: 'user',
                content: desc,
            }
        ]
    });
    
    return answer.response;

}

const descPrompt = "Create a short 30-90 character description of this Minecraft server. It should be detailed and descriptive instead of flashy. Do not include specific details like version, ip, name, commands, etc, instead focus on the overall purpose/selling point. Do not make it generic. Do not include generic words like minecraft, youtube, etc. Only include the raw description, no other output is needed. Do not exceed 90 characters.  Focus on the aspects related to the gamemode: {{MODE}}";