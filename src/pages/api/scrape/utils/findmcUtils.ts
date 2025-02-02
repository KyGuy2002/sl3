import { getMatchingMode, getTagsFromDesc } from "./utils";


export async function getIdList(page: number): Promise<string[]> {
    const res = await fetch(`https://findmcserver.com/api/servers?pageNumber=${page}&pageSize=15&sortBy=default&gamerSaferStatus=undefined&mojangStatus=undefined`);
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
            logoUrl: json.iconImage.url,
            bannerUrl: json.featuredImage.url || json.backgroundImage.url,
            ip: json.javaAddress,
            onlinePlayers: json.currentOnlinePlayers,
            online: json.isOnline,
            created: new Date(json.launchedOn).getTime(),
            lastUpdated: new Date(json.launchedOn).getTime(),
            versionStart: json.version[0].name,
            versionEnd: json.version[0].name, // TODO last one in array?
        },

        modes: await getGameModes(env, id, json.longDescription, json.serverTags),
    }

    return data;
}


async function getGameModes(env: any, serverId: string, desc: string, tags: any) {

    const serverModes: any = [];

    tags.map(async (t: any) => {
        if (t.name.startsWith("GAMEMODE-")) t.name = t.name.split("-")[1];

        const ourMode = await getMatchingMode(env, t.name, t.description);
        if (!ourMode) return;


        // Get tags
        const tagIds = await getTagsFromDesc(env, ourMode.id, desc, tags.map((t: any) => ({ name: t.name, desc: t.description })));

        
        serverModes.push({
            serverId: serverId,
            modeId: ourMode.id,
            cardDesc: desc.slice(0, 60), // TODO ai gen this?
            fullDesc: desc.slice(0, 200), // TODO ai gen this?
            tags: tagIds,
        });

    });

    return serverModes;

}