import { passkeyChallengesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";


export async function removeChallenge(DB: D1Database, challenge: string) {
    await drizzle(DB).delete(passkeyChallengesTable)
        .where(
            eq(passkeyChallengesTable.challenge, challenge)
        )
}

export async function addChallenge(DB: D1Database, challenge: string) {
    await drizzle(DB).insert(passkeyChallengesTable).values({
        challenge: challenge,
        expires: Date.now() + (1000 * 60 * 5), // 5 minutes
    })
}

export async function verifyChallengeExists(DB: D1Database, challenge: string): Promise<boolean> {

    const chalRes = await drizzle(DB).select().from(passkeyChallengesTable)
        .where(
            eq(passkeyChallengesTable.challenge, challenge)
        )
  
    // Challenge exists and not expired
    return (chalRes.length === 1 && chalRes[0].expires > Date.now());

}