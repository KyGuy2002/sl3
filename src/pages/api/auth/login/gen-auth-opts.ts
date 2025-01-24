import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import {
  generateAuthenticationOptions,
} from '@simplewebauthn/server';
import { authRpID } from "@/components/login/authUtils";
import { passkeyChallengesTable } from "@/db/schema";

export async function GET({ params, request, locals }: APIContext) {

  // Generate options
  const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
    rpID: authRpID
  });

  // Insert challenge into db
  await drizzle(locals.runtime.env.DB).insert(passkeyChallengesTable).values({
    challenge: options.challenge,
    expires: Date.now() + (1000 * 60 * 5), // 5 minutes
  })

  return new Response(JSON.stringify({ authOpts: options }));

}