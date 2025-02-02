import { serverModesTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import { getIdList, getServerDetails } from "./utils/findmcUtils";


export async function GET({ params, request, locals }: APIContext) {

    // let page = Number(new URL(request.url).searchParams.get("page"));

    // const servers: any = [];
    // const serverModes: any = [];

    const res = await getIdList(0);
    // res.forEach(async (id: string) => {
    //     const data = await getServerDetails(locals.runtime.env, id);
    //     servers.push(data.details);
    //     serverModes.push(data.modes);
    // });

    console.log(res[0])
    const data = await getServerDetails(locals.runtime.env, res[0]);
    console.log(data);
    // servers.push(data.details);
    // serverModes.push(data.modes);


    // await drizzle(locals.runtime.env.DB).insert(serversTable).values(servers).execute();
    // await drizzle(locals.runtime.env.DB).insert(serverModesTable).values(serverModes).execute();


    return new Response("Success!");

}