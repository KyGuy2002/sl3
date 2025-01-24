import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { authOrigin, authRpID } from "@/components/login/authUtils";
import { accountsTable, passkeyChallengesTable, passkeysTable } from "@/db/schema";
import { verifyChallengeExists } from "../utils";

export async function POST({ params, request, locals }: APIContext) {

  const body: any = await request.json();
  const authOpts: RegistrationResponseJSON = body.authOpts;
  const userId: string = body.userId;
  const challenge: string = body.challenge;

  // TODO validate input?


  // Make sure user is new, and no passkeys already exist (Maybe unnecessary?  Don't want unauthed users to add passkeys to existing accounts.)
  const userRes = await drizzle(locals.runtime.env.DB).select()
    .from(accountsTable)
    .innerJoin(passkeysTable, eq(accountsTable.id, passkeysTable.id))
    .where(
      eq(accountsTable.id, userId)
    )
  
  if (userRes.length > 0) return new Response("User already has passkeys.  This endpoint is only to be used for initial account registration.", { status: 400 });


  
  // Get current challenge - replay attack prevention
  if (!await verifyChallengeExists(locals.runtime.env.DB, challenge)) return new Response("Challenge not found", { status: 404 });


  // Verify
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: authOpts,
      expectedChallenge: challenge,
      expectedOrigin: authOrigin,
      expectedRPID: authRpID,
    });
  } catch (error: any) {
    console.log(error)
    await removeChallenge(locals.runtime.env.DB, challenge); // Remove challenge even on error - somethings wrong
    return new Response(`Error verifying registration response.  Message: (${error.message})`, { status: 400 });
  }
  if (!verification.verified) {
    await removeChallenge(locals.runtime.env.DB, challenge); // Remove challenge even on error - somethings wrong
    return new Response(`Verification unsuccessful`, { status: 400 });
  }

  const regInfo = verification.registrationInfo!;


  // Save passkey in db
  await drizzle(locals.runtime.env.DB).insert(passkeysTable).values({
    id: userId,
    credId: regInfo.credential.id,
    credPublicKey: regInfo.credential.publicKey,
    transports: regInfo.credential.transports,
    counter: regInfo.credential.counter,
    deviceType: regInfo.credentialDeviceType!,
    backedUp: regInfo.credentialBackedUp,
    createdAt: Date.now(),
  })


  // Remove challenge from db - prevent reuse in replay attack
  await removeChallenge(locals.runtime.env.DB, challenge);


  return new Response("Success");

}


async function removeChallenge(DB: D1Database, challenge: string) {
  // Remove challenge from db - prevent reuse in replay attack
  await drizzle(DB).delete(passkeyChallengesTable)
    .where(
      eq(passkeyChallengesTable.challenge, challenge)
    )
}