import type { APIContext } from "astro";
import { getIdList, getServerDetails } from "./utils/findmcUtils";
import { getItemsFromRaws } from "./utils/descTagModeUtils";


export async function GET({ params, request, locals }: APIContext) {
    const page = parseInt(new URL(request.url).searchParams.get("page") || "0");

    // Get all new server ids
    const res = await getIdList(page, 1);

    const data = await getServerDetails(locals.runtime.env, res[0]);

    if (!data) {
        return new Response("Skipped " + res[0].slug + " because not processable.");
    }

    const out = await ai(locals.runtime.env, data?.details.desc);

    const tags = await getItemsFromRaws(locals.runtime.env, "tag", out.response.features);
    const modes = await getItemsFromRaws(locals.runtime.env, "mode", out.response.features);

    // Get just an array of names
    const tNames = tags.map((t) => t.name);
    const mNames = modes.map((t) => t.name);

    return new Response(JSON.stringify({
        desc: data?.details.desc.split("\n"),
        ai_out: out.response.features,
        our_tags: tNames,
        our_modes: mNames,
    }));

}




async function ai(env: any, desc: string) {
    return await env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
        messages: [
            {
                role: "system",
                content: "Extract data about a minecraft server from a description.  The extracted features should be short and too the point, no fluff.  1-3 words each.  Include as many possible styles, gamemodes, features, plugins, or other details as possible.  Omit terms like unique, fun, welcoming, community, etc (DO NOT omit statements about the survival experience being traditional or vanilla/no plugins).  Also omit platforms and crossplay."
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
                },
                "required": ["features"]
            }
        }
    });
}