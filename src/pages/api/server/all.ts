import type { APIContext } from "astro";
import { and } from "drizzle-orm";
import { getServerDetails } from "./utils";


export async function GET({ params, request, locals }: APIContext) {


  const res = await getServerDetails(locals.runtime.env, and());


  return new Response(JSON.stringify(res))

}