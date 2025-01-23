import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm";
import type { APIContext } from "astro";
import { modesTable, serversTable } from "@/db/schema";

export async function GET({ params, request, locals }: APIContext) {

  const id = params.id!; 
  
  // Get details
  const response = await drizzle(locals.runtime.env.DB)
    .select()
    .from(serversTable)
    .innerJoin(modesTable, eq(modesTable.id, serversTable.id))
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


  return new Response(JSON.stringify(info))

}