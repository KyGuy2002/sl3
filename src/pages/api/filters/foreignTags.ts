import type { APIContext } from "astro";


export async function GET({ params, request, locals }: APIContext) {

    const obj: any = {};

    obj['findmcserver.com'] = await fetch('https://findmcserver.com/api/tags?type=KEYWORD').then(r => r.json());

    return new Response(JSON.stringify(obj))

}