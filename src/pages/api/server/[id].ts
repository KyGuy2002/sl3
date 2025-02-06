import { eq } from "drizzle-orm";
import type { APIContext } from "astro";
import { serversTable } from "@/db/schema";
import { getServerDetails } from "./utils";

export async function GET({ params, request, locals }: APIContext) {

  const id = params.id!; 
  
  const res = await getServerDetails(locals.runtime.env, eq(serversTable.id, id));

  if (res.length === 0) return new Response("Not found", { status: 404 });

  return new Response(JSON.stringify(res[0]))

}