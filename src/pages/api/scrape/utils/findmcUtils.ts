import { drizzle } from "drizzle-orm/d1";
import { getMatchingMode, getServerShortDesc, getTagsFromDesc } from "./utils";
import { allTagsTable } from "@/db/schema";
import { eq, or } from "drizzle-orm";


export async function getIdList(page: number): Promise<string[]> {
    const res = await fetch(`https://findmcserver.com/api/servers?pageNumber=${page}&pageSize=8&sortBy=default&gamerSaferStatus=undefined&mojangStatus=undefined`);
    const json: any = await res.json();

    const ids: string[] = [];

    json.data.map((server: any) => {
        if (!server.isMainAddressVisible) return;
        ids.push(server.slug);
    });

    return ids;
}


export async function getServerDetails(env: any, foreignId: string) {
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
            ip: json.javaAddress,
            onlinePlayers: json.currentOnlinePlayers,
            online: json.isOnline,
            created: new Date(json.launchedOn).getTime(),
            lastUpdated: new Date(json.launchedOn).getTime(),
            versionStart: json.version[0]?.name || "",
            versionEnd: json.version[0]?.name || "", // TODO last one in array?
        },

        modes: await getGameModes(env, id, json.longDescription, json.serverTags),
    }

    return data;
}


async function getGameModes(env: any, serverId: string, desc: string, tags: any) {
    console.log("===== getGameModes")

    const serverModes: any = [];

    // await tags.map(async (t: any) => {
    await handle(tags[0])
    async function handle(t: any) {
        if (t.name.startsWith("GAMEMODE-")) t.name = t.name.split("-")[1];

        const ourMode = await getMatchingMode(env, t.name, t.description);
        if (!ourMode) return;
        console.log("ourMode", ourMode)


        // Get tags
        const tagIds = await getTagsFromDesc(env, ourMode.id, desc, tags.map((t: any) => ({ name: t.name, desc: t.description })));

        // Get name
        const allOrs = tagIds.map((id: string) => eq(allTagsTable.id, id));

        const res = await drizzle(env.DB).select().from(allTagsTable).where(or(...allOrs)).execute();

        
        serverModes.push({
            serverId: serverId,
            modeId: ourMode.id, // TODO id not returned...
            modeName: ourMode.name,
            cardDesc: (await getServerShortDesc(env, desc, ourMode)).replaceAll("\"", " "),
            fullDesc: desc.slice(0, 200), // TODO ai gen this?
            tags: res.map((r: any) => r.name),
        });

    }
    // });

    return serverModes;

}