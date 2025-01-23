import type { APIContext } from "astro";
import { and, desc, eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { authOrigin, authRpID } from "@/components/login/authUtils";
import { passkeysTable } from "@/db/schema";

export async function GET({ params, request, locals }: APIContext) {

  // Generate options
  const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
    rpID: authRpID
  });

  // // TODO save challenge
  // await drizzle(locals.runtime.env.DB).insert(accountsTable).values({
  //         id: id,
  //         username: username,
  //         createdAt: Date.now(),
  //         passkeyChallenge: options.challenge,
  //     })

    return new Response(JSON.stringify({ authOpts: options }));

}