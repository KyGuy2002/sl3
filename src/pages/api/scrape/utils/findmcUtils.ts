import { drizzle } from "drizzle-orm/d1";
import { cleanupLinks, concatPort, getMatchingMode, getServerShortDesc, getTagsFromDesc, linksSame } from "./utils";
import { allTagsTable } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import type { ServerLinkType } from "../../server/utils";
import { capitalizeFirstLetter } from "@/components/utils";



export async function getIdList(page: number): Promise<string[]> {
    const res = await fetch(`https://findmcserver.com/api/servers?pageNumber=${page}&pageSize=8&sortBy=default&gamerSaferStatus=undefined&mojangStatus=undefined`);
    const json: any = await res.json();

    const ids: any[] = [];

    json.data.map((server: any) => {
        ids.push({
            slug: server.slug,
            id: server.id
        });
    });

    return ids;
}



export async function getServerDetails(env: any, foreignId: any) {
    const res = await fetch(`https://findmcserver.com/api/servers/${foreignId.slug}`);
    const json: any = await res.json();

    if (!json.serverLanguage.find((i: any) => i.name == "ENGLISH")) {
        console.log("Skipped " + json.name + " because not english");
        return undefined;
    }

    // TODO what is hostName/isHostVisible and what is statusName

    const id = crypto.randomUUID();
    const data = {
        details: {
            id: id,
            name: json.name,
            desc: json.longDescription,
            logoUrl: json.iconImage?.url || "",
            bannerUrl: json.featuredImage?.url || json.backgroundImage?.url || "",
            javaIp: concatPort("java", json.javaAddress, json.javaPort),
            bedrockIp: concatPort("bedrock", json.bedrockAddress, json.bedrockPort),
            otherJavaAddresses: json.secondaryAddresses.map((a: any) => concatPort(a.platform.toLowerCase(), a.address, a.port)),
            onlinePlayers: json.currentOnlinePlayers,
            online: json.isOnline,
            created: new Date(json.launchedOn).getTime(),
            lastUpdated: new Date(json.claimedOn).getTime(),
            versionStart: json.version[0]?.name.replace("X", 0) || undefined, // First in array else undefined
            versionEnd: (json.version.length > 1 ? json.version[json.version.length - 1].name.replace("X", 0) : undefined), // Last in array else undefined (also undefined if only 1)
            links: getLinks(json.serverMedias),
            locations: json.serverLocation.map((l: any) => l.description) || [],
            ipVisible: json.isMainAddressVisible,

            scrapedSource: "findmcserver.com",
            scrapedTime: Date.now(),
            scrapedId: {
                slug: json.slug,
                id: json.id
            }
        },

        modes: await getGameModes(env, id, json.longDescription, json.serverTags),
    }

    return data;
}



async function getGameModes(env: any, serverId: string, desc: string, tags: any) {
    const serverModes: any = [];

    await tags.map(async (t: any) => {
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

    });

    return serverModes;

}



function getLinks(json: any) {
    const links: ServerLinkType[] = [];

    if (json.presentationVideoUrl) links.push({ type: "TRAILER", url: json.presentationVideoUrl });
    if (json.privacyPolicyUrl) links.push({ type: "PRIVACY", url: json.privacyPolicyUrl });
    if (json.termsOfServiceUrl) links.push({ type: "TERMS", url: json.termsOfServiceUrl });
    if (json.codeOfConductUrl) links.push({ type: "RULES", url: json.codeOfConductUrl });

    for (const link of json) {
        let type;

        switch (link.social_media) {
            case "DISCORD": type = "DISCORD"; break;
            case "WEBSITE": type = "WEBSITE"; break;
            case "EMAIL": type = "EMAIL"; break;
            case "TWITTER": type = "TWITTER"; break;
            case "INSTAGRAM": type = "INSTAGRAM"; break;
            case "YOUTUBE": type = "YOUTUBE"; break;
            case "TIKTOK": type = "TIKTOK"; break;
            case "FACEBOOK": type = "FACEBOOK"; break;
            case "TWITCH": type = "TWITCH"; break;
            case "PATREON": type = "PATREON"; break;
            case "STORE": type = "STORE"; break;
            default: {
                console.log("===== Unknown link type found in getLinks:", json.ip, json.name, "Type:", link.social_media, "URL", link.url);
                type = capitalizeFirstLetter(link.social_media);
            }
        }

        links.push({
            type: type,
            url: link.url,
        });
    }

    return cleanupLinks(links);;
}