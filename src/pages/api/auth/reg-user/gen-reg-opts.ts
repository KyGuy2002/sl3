import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import {
    generateRegistrationOptions,
} from '@simplewebauthn/server';
import { authRpID, authRpName } from "@/components/login/authUtils";
import { accountsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addChallenge } from "../utils";

export async function GET({ params, request, locals }: APIContext) {

    let username = new URL(request.url).searchParams.get("username");
    if (!username) return new Response("No username provided", { status: 400 }); // TODO validate

    // Check if username is taken.
    const res = await drizzle(locals.runtime.env.DB).select().from(accountsTable)
        .where(
            eq(accountsTable.username, username)
        )

    if (res.length > 0) return new Response("Username taken", { status: 400 });


    // Create options
    const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
        rpName: authRpName,
        rpID: authRpID,
        userName: username,
        // Don't prompt users for additional information about the authenticator
        // (Recommended for smoother UX)
        attestationType: 'none',
        // Prevent users from re-registering existing authenticators
        // TODO use excludeCredentials when adding more passkeys in account settings
        // excludeCredentials: userPasskeys.map(passkey => ({
        //   id: passkey.id,
        //   // Optional
        //   transports: passkey.transports,
        // })),
        // See "Guiding use of authenticators via authenticatorSelection" below
        authenticatorSelection: {
          // Defaults
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
    });


    // Insert user into db
    // TODO do this on verify-reg instead?
    const id = crypto.randomUUID();
    await drizzle(locals.runtime.env.DB).insert(accountsTable).values({
        id: id,
        username: username,
        createdAt: Date.now(),
    })


    // Insert challenge into db
    await addChallenge(locals.runtime.env.DB, options.challenge);

    // Return new id and passkey options
    return new Response(JSON.stringify({
        userId: id,
        authOpts: options
    }))

}