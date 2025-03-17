import { cleanupLinks, concatPort } from "./utils";
import type { ServerLinkType, ServerModeType } from "../../server/utils";
import { capitalizeFirstLetter } from "@/components/utils";
import extractItemsFromDesc from "./scrapeUtils";
 


export async function getIdList(page: number, count: number): Promise<string[]> {
    const res = await fetch(`https://findmcserver.com/api/servers?pageNumber=${page}&pageSize=${count}&sortBy=default&gamerSaferStatus=undefined&mojangStatus=undefined`);
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
    const data: any = {
        details: {
            id: id,
            name: json.name,
            desc: json.longDescription,
            logoUrl: json.iconImage?.url || "",
            bannerUrl: json.featuredImage?.url || json.backgroundImage?.url || "",
            javaIp: concatPort("java", json.javaAddress, json.javaPort),
            bedrockIp: concatPort("bedrock", json.bedrockAddress, json.bedrockPort),
            otherJavaAddresses: json.secondaryAddresses?.map((a: any) => concatPort(a.platform.toLowerCase(), a.address, a.port)),
            onlinePlayers: json.currentOnlinePlayers,
            online: json.isOnline,
            created: new Date(json.launchedOn).getTime(),
            lastUpdated: new Date(json.claimedOn).getTime(),
            versionStart: json.version[0]?.name.replace("X", 0) || undefined, // First in array else undefined
            versionEnd: (json.version.length > 1 ? json.version[json.version.length - 1].name.replace("X", 0) : undefined), // Last in array else undefined (also undefined if only 1)
            links: getLinks(json.serverMedias),
            locations: json.serverLocation.map((l: any) => l.description) || [],
            ipVisible: json.isMainAddressVisible,
            ...getVersions(json),
            scrapedSource: "findmcserver.com",
            scrapedTime: Date.now(),
            scrapedId: {
                slug: json.slug,
                id: json.id
            }
        },
    }

    // Add parsed data
    const parseRes = await extractItemsFromDesc(env, data.details.desc, "findmcserver.com", json.serverTags.map((t: any) => t.id));

    // Combine modes and tags
    const finalModes: ServerModeType[] = [];
    for (const mode of parseRes.modes) {

        const newMode: ServerModeType = {
            details: mode,
            modeId: mode.id,
            serverId: id,
            cardDesc: parseRes.cardDescs[mode.id],
            fullDesc: "test",
            tags: parseRes.tags.filter((t) => t.modeId == mode.id).map((t) => {
                return {
                    tagId: t.id,
                    modeId: mode.id,
                    serverId: id,
                    details: t
                }
            })
        }

        finalModes.push(newMode);
    }

    data.details.gameModes = finalModes;

    const allLinks = [  ...data.details.links, ...parseRes.links ];
    data.details.links = cleanupLinks(allLinks);

    return data;
}


// NOTE: When only one tag is present, the versionStart is set and versionEnd is undefined.
async function getVersions(json: any) {

    const obj: Partial<{ versionStart: string, versionEnd: string }> = {};

    // Get first (skip weird ones)
    for (const v of json.version) {
        if (v.name == "Latest-Bedrock" || v.name == "Latest-Snapshot") continue;
        obj.versionStart = v.name.replace("X", 0);
        continue;
    }


    // Get last or undefined (unless first not set, then both undefined)
    const last = json.version[json.version.length - 1].name.replace("X", 0);
    if (obj.versionStart != undefined && last != obj.versionStart) {
        obj.versionEnd = last;
    }
    else obj.versionEnd = undefined;

    return obj;
}


function getLinks(json: any) {
    const links: ServerLinkType[] = [];

    if (json.presentationVideoUrl) links.push({ type: "TRAILER", url: json.presentationVideoUrl });
    if (json.privacyPolicyUrl) links.push({ type: "PRIVACY", url: json.privacyPolicyUrl });
    if (json.termsOfServiceUrl) links.push({ type: "TERMS", url: json.termsOfServiceUrl });
    if (json.codeOfConductUrl) links.push({ type: "RULES", url: json.codeOfConductUrl });

    for (const link of json) {
        let type;

        // NOTE: Make sure to update in ServerLinkType and ServerLinkBtn.tsx
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
            case "BLUESKY": type = "BLUESKY"; break;
            default: {
                // TODO try to find using other logic
                console.log("===== Unknown link type found in getLinks:", "Type: (", link.social_media, "). URL: (", link.url, ").");
                type = capitalizeFirstLetter(link.social_media);
            }
        }

        links.push({
            type: type,
            url: link.url,
        });
    }

    return links;
}