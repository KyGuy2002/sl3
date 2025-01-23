import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { authOrigin, authRpID } from "@/components/login/authUtils";
import { accountsTable, passkeysTable } from "@/db/schema";

export async function POST({ params, request, locals }: APIContext) {

  const body: any = await request.json();
  const authOpts: RegistrationResponseJSON = body.authOpts;
  const userId: string = body.userId;

  // TODO validate input?


  
  // Get current challenge
  const res = await drizzle(locals.runtime.env.DB).select({
    challenge: accountsTable.passkeyChallenge
  }).from(accountsTable).where(
    eq(accountsTable.id, userId)
  )
  if (res.length === 0) return new Response("User not found", { status: 404 });
  if (!res[0].challenge) return new Response("User not currently setting up a passkey.", { status: 400 });
  const challenge = res[0].challenge;


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
    return new Response(`Error verifying registration response.  Message: (${error.message})`, { status: 400 });
  }
  if (!verification.verified) return new Response(`Verification unsuccessful`, { status: 400 });

  const regInfo = verification.registrationInfo!;


  // TODO wait until?

  // Save passkey in db
  await drizzle(locals.runtime.env.DB).insert(passkeysTable).values({
    id: userId,
    credId: regInfo.credential.id,
    credPublicKey: regInfo.credential.publicKey,
    transports: JSON.stringify(regInfo.credential.transports),
    counter: regInfo.credential.counter,
    deviceType: regInfo.credentialDeviceType!,
    backedUp: regInfo.credentialBackedUp,
    createdAt: Date.now(),
  })


  return new Response("Success");

}