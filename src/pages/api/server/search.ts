import { modesTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { and, desc, eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function GET({ params, request, locals }: APIContext) {
  
  const mode = new URL(request.url).searchParams.get("mode");
  let tags = new URL(request.url).searchParams.get("tags");
  // const text = new URL(request.url).searchParams.get("text");

  // TODO allow any combo
  // TODO add text search
  if (!mode || !tags) return new Response("Missing parameters.", { status: 400 });

  const likeStatements = tags.split(",").map(tag => {
    console.log(tag)
    return like(modesTable.tags, `%\"${tag}\"%`);
  });


  // All
  // TODO also get all other modes
  const response = await drizzle(locals.runtime.env.DB)
    .select({
      id: serversTable.id,
      name: serversTable.name,
      ip: serversTable.ip,
      mode: modesTable.mode,
      tags: modesTable.tags,
      modeCardDesc: modesTable.cardDesc,
      onlinePlayers: serversTable.onlinePlayers,
      versionStart: serversTable.versionStart,
      versionEnd: serversTable.versionEnd,
    })
    .from(modesTable)
    .innerJoin(serversTable, eq(modesTable.id, serversTable.id))
    .where(
      and(
        eq(modesTable.mode, mode),
        ...likeStatements,
        eq(serversTable.online, true),
      )
    )
    .orderBy(...getOrder());

  return new Response(JSON.stringify(response))

}


function getOrder() { // TODO does drizzle read both items correctly, or just the first one?
  return [desc(serversTable.lastUpdated), desc(serversTable.onlinePlayers)]
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
  bannerUrl: string,
  logoUrl: string,
}