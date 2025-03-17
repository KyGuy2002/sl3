import { serverModesTable, serverModesTagsTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import { getIdList, getServerDetails } from "./utils/findmcUtils";
import { eq } from "drizzle-orm";
import type { ServerModeType } from "../server/utils";


export async function GET({ params, request, locals }: APIContext) {
    const page = parseInt(new URL(request.url).searchParams.get("page") || "0");

    console.log("\u001b[0m")

    const servers: any = [];
    const serverModes: any = [];

    // Get all new server ids
    const res = await getIdList(page, 1);

    // const res = [
    //     {
    //         slug: "libregalaxy",
    //         id: "36ce882f-27ef-4567-912a-9b362dfda4a3"
    //     }
    // ]

    // Get all existing foreign server ids
    const existing = await drizzle(locals.runtime.env.DB).select({ id: serversTable.scrapedId }).from(serversTable).where(eq(serversTable.scrapedSource, "findmcserver.com"));

    // Get details and process each server
    for (const r of res) {
        if (existing.find((e: any) => e.id.id == r.id)) {
            console.log("\u001b[1;33m Skipped " + r.slug + " because already exists");
            continue;
        }
        const data = await getServerDetails(locals.runtime.env, r);
        if (!data) {
            console.log("\u001b[1;33m Skipped " + r.slug + " because not processable.");
            continue;
        }

        return new Response(JSON.stringify(data));

        // Skip mode if has no tags
        for (const mode of data.modes) {
            if (mode.tags.length == 0) {
                console.log("\u001b[1;36m === Skipped " + r.slug + " mode " + mode.details.name + " because no tags.");
                data.modes = data.modes.filter((m: ServerModeType) => m.modeId != mode.modeId);
                // TODO remove this!
                continue;
            }
        }

        // Skip server if no modes
        if (data.modes.length == 0) {
            console.log("\u001b[1;33m Skipped " + r.slug + " because no modes.");
            continue;
        }

        servers.push(data.details);
        serverModes.push(...data.modes);
    }

    console.log("\u001b[1;32m Scraped " + servers.length + " servers");
    console.log("\u001b[1;32m Scraped " + serverModes.length + " server modes");

    // Add to database - Split into 5 item chunks
    const SIZE = 5;
    for (let i = 0; i < servers.length; i += SIZE) await drizzle(locals.runtime.env.DB).insert(serversTable).values(servers.slice(i, i + SIZE));
    for (let i = 0; i < serverModes.length; i += SIZE) await drizzle(locals.runtime.env.DB).insert(serverModesTable).values(serverModes.slice(i, i + SIZE));

    // Get all tags
    const serverTags = serverModes.map((m: any) => m.tags).flat().filter((t: any) => t);
    for (let i = 0; i < serverTags.length; i += SIZE) await drizzle(locals.runtime.env.DB).insert(serverModesTagsTable).values(serverTags.slice(i, i + SIZE));


    return new Response("Success!");

}