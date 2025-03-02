import { serverModesTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import { getIdList, getServerDetails } from "./utils/findmcUtils";
import { toNumber } from "lodash";
import { eq } from "drizzle-orm";


export async function GET({ params, request, locals }: APIContext) {
    const page = toNumber(new URL(request.url).searchParams.get("page") || 0);
    
    const servers: any = [];
    const serverModes: any = [];

    // Get all new server ids
    const res = await getIdList(page);

    // Get all existing foreign server ids
    const existing = await drizzle(locals.runtime.env.DB).select({ id: serversTable.scrapedId }).from(serversTable).where(eq(serversTable.scrapedSource, "findmcserver.com"));

    // Get details and process each server
    for (const r of res) {
        if (existing.find((e: any) => e.id.id == r)) {
            console.log("Skipped " + r + " because already exists");
            continue;
        }
        const data = await getServerDetails(locals.runtime.env, r);
        if (!data) {
            console.log("Skipped " + r + " because not processable.");
            continue;
        }
        servers.push(data.details);
        serverModes.push(data.modes);
    }

    // Add to database - Split into 15 item chunks
    for (let i = 0; i < servers.length; i += 15) await drizzle(locals.runtime.env.DB).insert(serversTable).values(servers.slice(i, i + 15)).execute();
    for (let i = 0; i < serverModes.length; i += 15) await drizzle(locals.runtime.env.DB).insert(serverModesTable).values(serverModes.slice(i, i + 15)).execute();


    return new Response("Success!");

}