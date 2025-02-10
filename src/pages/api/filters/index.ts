import type { APIContext } from "astro";
import type { ModeDetailsType, TagDetailsType } from "../server/utils";
import { drizzle } from "drizzle-orm/d1";
import { allModesTable, allTagsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import _ from "lodash";


export async function POST({ params, request, locals }: APIContext) {
    const body: { tags: TagDetailsType[], modes: ModeDetailsType[] } = await request.json();

    if (!body.tags || !body.modes) return new Response('Invalid body', { status: 400 });
    
    // Get current
    const currentModes = await drizzle(locals.runtime.env.DB).select().from(allModesTable);
    const currentTags = await drizzle(locals.runtime.env.DB).select().from(allTagsTable);

    // Get new modes
    const newModes = body.modes.filter(m => !currentModes.find(cm => cm.id === m.id));

    // Add new modes to db
    if (newModes.length > 0) await drizzle(locals.runtime.env.DB).insert(allModesTable).values(newModes);

    // Get new tags
    const newTags = body.tags.filter(t => !currentTags.find(ct => ct.id === t.id));

    // Add new tags to db
    if (newTags.length > 0) await drizzle(locals.runtime.env.DB).insert(allTagsTable).values(newTags);

    // Get edited modes
    const editedModes = body.modes.filter(m => {
        const current = currentModes.find(cm => cm.id === m.id);
        if (newModes.includes(m)) return false;
        return !_.isEqual(current, m);
    });

    // Update edited modes
    for (const mode of editedModes) {
        await drizzle(locals.runtime.env.DB).update(allModesTable).set(mode).where(eq(allModesTable.id, mode.id));
    }

    // Get edited tags
    const editedTags = body.tags.filter(m => {
        const current = currentTags.find(cm => cm.id === m.id);
        if (newTags.includes(m)) return false;
        return !_.isEqual(current, m);
    });

    // Update edited tags
    for (const mode of editedTags) {
        await drizzle(locals.runtime.env.DB).update(allTagsTable).set(mode).where(eq(allTagsTable.id, mode.id));
    }

    return new Response('OK', { status: 200 });

}
