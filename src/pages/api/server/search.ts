import { serverModesTable, serverModesTagsTable, serversTable } from "@/db/schema";
import type { APIContext } from "astro";
import { and, asc, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getServerDetails } from "./utils";


export async function GET({ params, request, locals }: APIContext) {
  
  let mode: string | undefined | null = new URL(request.url).searchParams.get("mode");
  const platform = new URL(request.url).searchParams.get("platform");
  const sort = new URL(request.url).searchParams.get("sort");
  let rawTags: string | undefined | null = new URL(request.url).searchParams.get("tags");
  const tags = ((rawTags && rawTags != "null") ? rawTags.split(",") : []);

  if (mode == "null") mode = undefined;
  if (rawTags == "null") rawTags = undefined;

  // TODO allow any combo
  // TODO add text search
  if (!platform) return new Response("Missing parameters. (platform)", { status: 400 });
  if (!mode && rawTags) return new Response("Must have mode if providing tags.", { status: 400 });
  if (platform != "java" && platform != "bedrock") return new Response("Invalid platform. (java, bedrock)", { status: 400 });

  let orderByStatements;
  if (!sort || sort == "null") orderByStatements = undefined; // Default sort (defined in utils.ts)
  else if (sort == "most_players") orderByStatements = [desc(serversTable.onlinePlayers)]
  else if (sort == "new_updated") orderByStatements = [desc(serversTable.lastUpdated)]
  else if (sort == "new_created") orderByStatements = [desc(serversTable.created)]
  else if (sort == "old_created") orderByStatements = [asc(serversTable.created)]
  else return new Response("Invalid sort. (most_players, new_updated, new_created, old_created)", { status: 400 });


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
        ...(mode ? [eq(serverModesTable.modeId, mode)] : []),
        ...tagsStatement,
        eq(serversTable.online, true),
        ...(platform == "bedrock" ? [isNotNull(serversTable.bedrockIp)] : [isNotNull(serversTable.javaIp)]),
      )
    )
    .groupBy(serversTable.id);
  
  const res = await getServerDetails(locals.runtime.env, inArray(serversTable.id, subquery), orderByStatements);
  

  return new Response(JSON.stringify(res));

}