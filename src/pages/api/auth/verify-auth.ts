import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { authOrigin, authRpID } from "@/components/login/authUtils";
import { accountsTable, passkeysTable } from "@/db/schema";

export async function POST({ params, request, locals }: APIContext) {

  const body: any = await request.json();
  // TODO validate?
  const authOpts: AuthenticationResponseJSON = body.authOpts;
  const userId: string = body.userId;


  // Get users passkey with id authRes.id
  const passkeyRes = await drizzle(locals.runtime.env.DB).select().from(passkeysTable).where(
    eq(passkeysTable.id, authOpts.id)
  );
  if (passkeyRes.length === 0) return new Response("Passkey not found", { status: 404 });
  const passkey = passkeyRes[0];
  
  
    // TODO use userid or passkey id and db to get the challenge? (from authRes)
    // Get current options
    const res = await drizzle(locals.runtime.env.DB).select({
      challenge: accountsTable.passkeyChallenge
    }).from(accountsTable).where(
      eq(passkeysTable.id, userId)
    )
  
    if (res.length === 0) return new Response("User not found", { status: 404 });
    if (!res[0].challenge) return new Response("User not currently setting up a passkey.", { status: 400 });
    const challenge = res[0].challenge;
  
  


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
      return new Response(`Error verifying registration response.  Message: (${error.message})`, { status: 400 });
    }
  
    if (!verification.verified) return new Response(`Verification unsuccessful`, { status: 400 });


  
  
    // TODO wait until?
    const response = await drizzle(locals.runtime.env.DB).update(passkeysTable).set({
      counter: verification.authenticationInfo.newCounter,
      lastUsed: Date.now(),
    }).where(
      eq(passkeysTable.id, passkey.id)
    )
  
  
    return new Response("Success");
}