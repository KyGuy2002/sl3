import { allModesTable, allTagsTable, serverModesTable, serverModesTagsTable, serversTable } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function getServerDetails(env: any, whereClause: any, orderByStatements: any, limit: number = 100) {

    // NOTE: A servers mode will be ommited if it has no tags.  This should never happen in prod though.

    const res = await drizzle(env.DB)
        .select()
        .from(serversTable)
        .innerJoin(serverModesTable,
            eq(serverModesTable.serverId, serversTable.id)
        )
        .innerJoin(serverModesTagsTable,
            and(
                eq(serverModesTagsTable.serverId, serversTable.id),
                eq(serverModesTagsTable.modeId, serverModesTable.modeId)
            )
        )
        .innerJoin(allModesTable,
            eq(allModesTable.id, serverModesTable.modeId)
        )
        .innerJoin(allTagsTable,
            eq(serverModesTagsTable.tagId, allTagsTable.id)
        )
        .where(
            whereClause
        )
        .orderBy(...(orderByStatements || getServerQueryOrder()))
        .limit(limit);
    

    const newRes: any = {};
    for (const e of res) {

        // First time with server
        if (!newRes[e.servers.id]) {
            newRes[e.servers.id] = {
                ...e.servers,
                modes: []
            }
        }

        // First time with mode
        if (!newRes[e.servers.id].modes.find((m: any) => m.details.id === e.all_modes.id)) {
            newRes[e.servers.id].modes.push({
                details: e.all_modes,
                cardDesc: e.server_modes.cardDesc,
                fullDesc: e.server_modes.fullDesc,
                tags: []
            });
        }

        // Add tag to mode
        newRes[e.servers.id].modes.find((m: any) => m.details.id === e.all_modes.id).tags.push(e.all_tags);
    
    };
    
    const finalRes: any[] = [];
    for (const key in newRes) {
        finalRes.push({ id: key, ...newRes[key] });
    }

    return finalRes;
}


export function getServerQueryOrder() { // TODO does drizzle read both items correctly, or just the first one?
    return [desc(serversTable.lastUpdated), desc(serversTable.onlinePlayers)]
}


export type ServerCardDetails = {
    id: string,
    name: string,
    javaIp?: string,
    bedrockIp?: string,
    desc: string,
    modes: [
      ServerModeType
    ],
    online: boolean,
    onlinePlayers: number,
    versionStart: string,
    versionEnd: string,
    logoUrl: string,
    bannerUrl: string,
    lastUpdated: number,
    created: number,
}

export type ServerModeType = {
    details: ModeDetailsType,
    cardDesc: string,
    fullDesc: string,
    tags: TagDetailsType[]
  }

export type ModeDetailsType = {
    id: string,
    name: string,
    desc: string,
    aka: string[]
}

export type TagDetailsType = {
    id: string,
    name: string,
    desc: string,
    type: string,
    aka: string[],
    modeId: string
}

export type ServerLinkType = {
    type: "DISCORD" | "WEBSITE" | "FORUM" | "OTHER" | string,
    url: string
}