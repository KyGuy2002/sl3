import { serverModesTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import { getIdList, getServerDetails } from "./utils/findmcUtils";


export async function GET({ params, request, locals }: APIContext) {
    const servers: any = [];
    const serverModes: any = [];

    const no1 = Math.floor(Math.random() * 10);
    const res = await getIdList(no1);
    // await res.forEach(async (id: string) => {
    //     const data = await getServerDetails(locals.runtime.env, id);
    //     servers.push(data.details);
    //     serverModes.push(data.modes);
    // });

    const no = Math.floor(Math.random() * (res.length));
    const data = await getServerDetails(locals.runtime.env, res[no]);
    if (!data) return new Response("rejected...");

    servers.push(data.details);
    serverModes.push(data.modes);


    await drizzle(locals.runtime.env.DB).insert(serversTable).values(servers).execute();
    await drizzle(locals.runtime.env.DB).insert(serverModesTable).values(serverModes).execute();


    return new Response(JSON.stringify(data));

}