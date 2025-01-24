import { startAuthentication, startRegistration } from '@simplewebauthn/browser';



export const authRpName = 'Minecraft Server List';
export const authRpID = 'localhost'; // Unique ID for app // sl3.ieatbeans.com
export const authOrigin = `http://${authRpID}:4321`; // URL.  No trailing slash. // https



export async function createPasskey(username: string) {

    const res = await fetch("/api/auth/reg-user/gen-reg-opts?username=" + username);
    const json: any = await res.json();


    // TODO what is autoRegister?  https://simplewebauthn.dev/docs/packages/browser#auto-register-conditional-create
    let attResp;
    try {
        attResp = await startRegistration({ optionsJSON: json.authOpts });
    } catch (error) {
        console.error(error); // TODO error on page
        return;
    }

    const res2 = await fetch("/api/auth/reg-user/verify-reg", {
        method: "POST",
        body: JSON.stringify({
            userId: json.userId,
            challenge: json.authOpts.challenge, // Send the challenge back so the server can make sure it still exists (replay attack prevention)
            authOpts: attResp
        })
    });
    if (res2.status !== 200) {
        console.error(await res2.text());
        return;
    }

    alert("Successfully saved passkey!");

}


export async function authPasskey() {

    const res = await fetch("/api/auth/login/gen-auth-opts");
    const json: any = await res.json();


    
    let attResp;
    try {
        attResp = await startAuthentication({ optionsJSON: json.authOpts });
    } catch (error) {
        console.error(error); // TODO error on page
        return;
    }

    const res2 = await fetch("/api/auth/login/verify-auth", {
        method: "POST",
        body: JSON.stringify({
            challenge: json.authOpts.challenge, // Send the challenge back so the server can make sure it still exists (replay attack prevention)
            authOpts: attResp
        })
    });
    if (res2.status !== 200) {
        console.error(await res2.text());
        return;
    }

    alert("Successfully authenticated!");

}