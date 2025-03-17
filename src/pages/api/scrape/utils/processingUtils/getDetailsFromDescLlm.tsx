import { allModesTable } from "@/db/schema";
import { drizzle } from "drizzle-orm/d1";


/**
 * @returns Array of strings of exact names of OUR gamemodes (can be used with SQL name == ?, FTS not needed), raw features, links, and emails.
 */
export async function getDetailsFromDescLlm(env: any, desc: string) {

    // Get all modes
    const modes = await drizzle(env.DB).select().from(allModesTable);

    // Convert to string
    const modeEnums = modes.map((m) => `${m.name} - ${m.desc} - aka: ${m.aka.join(", ")}`);

    // Run AI
    const res = await env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
        messages: [
            {
                role: "system",
                content: "Extract details from a minecraft server description.  Gamemodes: If you are not sure that a gamemode is present, do not include it.  Features: The extracted features should be short and too the point, no fluff.  No duplicates.  Do not include any gamemodes in the features response.  1-3 words each.  Include as many possible styles, features, plugins, or other details.  Omit terms like unique, fun, welcoming, community, etc (DO NOT omit statements about the survival experience being traditional or vanilla/no plugins).  Also omit platforms and crossplay."
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
                    "gamemodes": {
                        "type": "array",
                        "items": {
                            "type": "enum",
                            "enum": modeEnums
                        }
                    },
                    "features": {
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

    // Strip desc and aka
    const resModeNames = res.response.gamemodes.map((m: string) => m.split(" - ")[0]);

    return {
        ourModeNames: resModeNames,
        rawFeatures: res.response.features,
        links: res.response.links,
        emails: res.response.email_addresses
    };

}