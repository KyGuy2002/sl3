import { addIfMapped, cleanupLinks, concatPort } from "./utils";
import type { ServerLinkType, ServerModeType } from "../../server/utils";
import { capitalizeFirstLetter } from "@/components/utils";
 


export async function getIdList(page: number): Promise<string[]> {
    const res = await fetch(`https://findmcserver.com/api/servers?pageNumber=${page}&pageSize=10&sortBy=default&gamerSaferStatus=undefined&mojangStatus=undefined`);
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
    const serverModes: ServerModeType[] = [];

    // Map existing gamemodes and tags
    await tags.map(async (t: any) => {

        // Get from map
        const mapped = await addIfMapped(env, serverModes, serverId, t.id, "findmcserver.com");

    });

    // TODO get addtl gamemodes and tags from description

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