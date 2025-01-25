import { allModesTable, allTagsTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {

    let page = Number(new URL(request.url).searchParams.get("page"));

    const res = await fetch("https://findmcserver.com/api/servers/discover");
    const json: any = await res.json();

    const data = [];

    for (let i = (page * 5); i < ((page+1) * 5); i++) {
        if (json.length <= i) break;
        const s = json[i];

        const d = await getDetails(s.slug);
        data.push(d);

    }


    await drizzle(locals.runtime.env.DB).insert(serversTable).values(data).execute();


    return new Response("Success!")

}


async function getDetails(slug: string) {

    const res = await fetch("https://findmcserver.com/api/servers/"+slug);
    const json: any = await res.json();

    console.log(json)

    return {
        id: crypto.randomUUID(),
        name: json.name || "",
        ip: json.javaAddress || "",
        desc: json.longDescription || "",
        onlinePlayers: json.onlinePlayers || 0,
        versionStart: json.version[0]?.description || "",
        versionEnd: json.version[0]?.description || "",
        online: json.isOnline || false,
        created: Date.now(),
        lastUpdated: Date.now()
    }
    

}