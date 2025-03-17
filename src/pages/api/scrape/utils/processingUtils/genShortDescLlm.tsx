import type { ModeDetailsType } from "@/pages/api/server/utils";

export default async function genShortDescLlm(env: any, desc: string, modes: ModeDetailsType[]) {

    const props: any = {};
    for (const m of modes) {
        props[m.id] = {
            "type": "string",
            "description": `${m.name} - ${m.desc} - aka: ${m.aka.join(", ")}`
        }
    }
    
    const res = await env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
        messages: [
            {
                role: "system",
                content: "Generate a short description for a minecraft server for each of the specified gamemodes based on the longer server description provided.  Description should be 20-50 characters and should focus on the unique parts about the gamemode and/or server."
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
                    "shortDescriptions": {
                        "type": "object",
                        "properties": props
                    },
                },
                "required": ["shortDescriptions"]
            }
        }
    });

    return res.response.shortDescriptions;
}