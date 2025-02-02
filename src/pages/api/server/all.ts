import { modesTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { and, desc, eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {


  // All
  const response = await drizzle(locals.runtime.env.DB)
    .select({
      id: serversTable.id,
      name: serversTable.name,
      ip: serversTable.ip,
      onlinePlayers: serversTable.onlinePlayers,
      versionStart: serversTable.versionStart,
      versionEnd: serversTable.versionEnd,
      desc: serversTable.desc,
    })
    .from(serversTable)
  

  response.map((server: any) => {
    server.mode = "Creative"
    server.tags = ["NPC", "Creative", "Roleplay"]
    server.modeCardDesc = server.desc.slice(0, 70);
  })

  return new Response(JSON.stringify(response))

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