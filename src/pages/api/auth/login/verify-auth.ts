import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { authOrigin, authRpID } from "@/components/login/authUtils";
import { passkeysTable } from "@/db/schema";
import { removeChallenge, verifyChallengeExists } from "../utils";

export async function POST({ params, request, locals }: APIContext) {

  const body: any = await request.json();
  const authOpts: AuthenticationResponseJSON = body.authOpts;
  const challenge: string = body.challenge;

  // TODO validate input?


  // Get current challenge - replay attack prevention
  if (!await verifyChallengeExists(locals.runtime.env.DB, challenge)) return new Response("Challenge not found", { status: 404 });


  // Get users passkey with id
  const passkeyRes = await drizzle(locals.runtime.env.DB).select().from(passkeysTable).where(
    eq(passkeysTable.credId, authOpts.id)
  );
  if (passkeyRes.length === 0) return new Response("Passkey not found", { status: 404 });
  const passkey: any = passkeyRes[0];
  

  // Verify
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: authOpts,
      expectedChallenge: challenge,
      expectedOrigin: authOrigin,
      expectedRPID: authRpID,
      credential: {
        id: passkey.id,
        publicKey: passkey.credPublicKey,
        counter: passkey.counter,
        transports: passkey.transports,
      },
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


  // Update passkey counter and lastUsed
  await drizzle(locals.runtime.env.DB).update(passkeysTable).set({
    counter: verification.authenticationInfo.newCounter,
    lastUsed: Date.now(),
  }).where(
    eq(passkeysTable.id, passkey.id)
  )
  

  // Remove challenge from db - prevent reuse in replay attack
  await removeChallenge(locals.runtime.env.DB, challenge);


  // TODO Set cookie
  

  return new Response("Success");

}