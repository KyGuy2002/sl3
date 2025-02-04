import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm";
import type { APIContext } from "astro";
import { serverModesTable, serversTable } from "@/db/schema";
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

export async function GET({ params, request, locals }: APIContext) {

  const id = params.id!; 
  
  // Get details
  const response = await drizzle(locals.runtime.env.DB)
    .select()
    .from(serversTable)
    .innerJoin(serverModesTable, eq(serverModesTable.serverId, serversTable.id))
    .where(
      eq(serversTable.id, id)
    );
  
  // One row for each mode (with entire server data appended)

  if (response.length === 0) return new Response("Server not found.", { status: 404 });
  
  
  const info = {
    ...response[0].servers,
    modes: [
      ...response.map((r) => {
        return {
          ...r.server_modes
        }
      })
    ]
  }  

  // info.desc = DOMPurify.sanitize(
  //   (await marked.parse(
  //     info.desc
  //   ))
  //   .replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,"") // Remove common zero-width characters (could cause issues)
  // );


  return new Response(JSON.stringify(info))

}