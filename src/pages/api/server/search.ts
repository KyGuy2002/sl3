import { serverModesTable, serverModesTagsTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { and, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getServerDetails } from "./utils";


export async function GET({ params, request, locals }: APIContext) {
  
  const mode = new URL(request.url).searchParams.get("mode");
  const rawTags = new URL(request.url).searchParams.get("tags");
  const tags = ((rawTags && rawTags != "null") ? rawTags.split(",") : []);

  // TODO allow any combo
  // TODO add text search
  if (!mode) return new Response("Missing parameters.", { status: 400 });


  const tagsStatement = [];
  for (const t of tags) {
    tagsStatement.push(eq(serverModesTagsTable.tagId, t));
  }

  const subquery = drizzle(locals.runtime.env.DB)
    .select({id: serversTable.id})
    .from(serversTable)
    .innerJoin(serverModesTable, eq(serverModesTable.serverId, serversTable.id))
    .innerJoin(serverModesTagsTable, and(
      eq(serverModesTagsTable.serverId, serversTable.id),
      eq(serverModesTagsTable.modeId, serverModesTable.modeId)
    ))
    .where(
      and(
        eq(serverModesTable.modeId, mode),
        ...tagsStatement,
        eq(serversTable.online, true),
      )
    )
    .groupBy(serversTable.id);
  
  
  
  const res = await getServerDetails(locals.runtime.env, inArray(serversTable.id, subquery));
  

  return new Response(JSON.stringify(res));

}