import { allModesTable, allTagsTable, serverModesTable, serverModesTagsTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import { getIdList } from "./utils/findmcUtils";


export async function GET({ params, request, locals }: APIContext) {


    const allTags = await drizzle(locals.runtime.env.DB).select().from(allTagsTable);
    const allServerModes = await drizzle(locals.runtime.env.DB).select().from(serverModesTable);

    const serverModesTags: any[] = [];

    for (const s of allServerModes) {

        const tags1 = allTags.sort(() => Math.random() - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2).map(async (tag: any) => {

            await drizzle(locals.runtime.env.DB).insert(serverModesTagsTable).values({
                serverId: s.serverId,
                modeId: s.modeId,
                tagId: tag.id,
            }).execute();

            serverModesTags.push({
                serverId: s.serverId,
                modeId: s.modeId,
                tagId: tag.id,
            });

        });

    }

    // await drizzle(locals.runtime.env.DB).insert(serverModesTagsTable).values(serverModesTags).execute();

    return new Response(JSON.stringify(serverModesTags));


    // let page = Number(new URL(request.url).searchParams.get("page"));

    const servers: any = [];
    const serverModes: any = [];

    const no1 = Math.floor(Math.random() * 10);
    const res = await getIdList(no1);
    // await res.forEach(async (id: string) => {
    //     const data = await getServerDetails(locals.runtime.env, id);
    //     servers.push(data.details);
    //     serverModes.push(data.modes);
    // });

    for (const r of res) {
        const data = await getServerDetails(locals.runtime.env, r);
        servers.push(data.details);
        serverModes.push(...data.modes);
    }


    await drizzle(locals.runtime.env.DB).insert(serversTable).values(servers).execute();
    await drizzle(locals.runtime.env.DB).insert(serverModesTable).values(serverModes).execute();


    return new Response("success");

}



async function getServerDetails(env: any, foreignId: string) {
    const res = await fetch(`https://findmcserver.com/api/servers/${foreignId}`);
    const json: any = await res.json();

    const id = crypto.randomUUID();
    const data = {
        details: {
            id: id,
            name: json.name,
            desc: json.longDescription,
            logoUrl: json.iconImage?.url || "",
            bannerUrl: json.featuredImage?.url || json.backgroundImage?.url || "",
            ip: json.javaAddress || json.bedrockAddress || "placeholder.com",
            onlinePlayers: json.currentOnlinePlayers,
            online: json.isOnline,
            created: new Date(json.launchedOn).getTime(),
            lastUpdated: new Date(json.launchedOn).getTime(),
            versionStart: json.version[0]?.name || "",
            versionEnd: json.version[0]?.name || "", // TODO last one in array?
        },

        modes: await getGameModes(env, id),
    }

    return data;
}


async function getGameModes(env: any, serverId: string) {

    const serverModes: any = [];

    const res1 = await drizzle(env.DB).select().from(allTagsTable);
    // Get 6 random tags
    const tags1 = res1.sort(() => Math.random() - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2).map((tag: any) => tag.name);

    const res = await drizzle(env.DB).select().from(allModesTable);
    const randRes = res[Math.floor(Math.random() * res.length)];
    serverModes.push({
        serverId: serverId,
        modeId: randRes.id,
        modeName: randRes.name,
        cardDesc: randRes.desc,
        fullDesc: "temp",
        tags: tags1,
    })

    return serverModes;

}