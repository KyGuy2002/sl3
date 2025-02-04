import { serverModesTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { and, desc, eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {


  // All
  const response = await drizzle(locals.runtime.env.DB)
    .select()
    .from(serversTable)
    .innerJoin(serverModesTable, eq(serversTable.id, serverModesTable.serverId))
  

  // TODO work with many to one relation
  const newRes = [];
  response.map((res: any) => {
    const server = res.servers;
    const mode = res.server_modes;
    server.mode = mode.name;
    server.tags = mode.tags;
    server.modeCardDesc = mode.cardDesc;
    newRes.push(server);
  })


  return new Response(JSON.stringify(newRes))

}

export type ServerCardDetails = {
  id: string,
  name: string,
  ip: string,
  mode: string,
  tags: string[],
  modeCardDesc: string,
  onlinePlayers: number,
  versionStart: string,
  versionEnd: string,
}