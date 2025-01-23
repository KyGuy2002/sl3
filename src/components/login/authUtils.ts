import { startAuthentication, startRegistration } from '@simplewebauthn/browser';



export const authRpName = 'Minecraft Server List';
export const authRpID = 'localhost'; // Unique ID for app // sl3.ieatbeans.com
export const authOrigin = `http://${authRpID}:4321`; // URL.  No trailing slash. // https



export async function createPasskey(username: string) {
    console.log("hello!!!")

    const res = await fetch("/api/auth/gen-reg-opts?username=" + username);
    const json: any = await res.json();


    // TODO what is autoRegister?  https://simplewebauthn.dev/docs/packages/browser#auto-register-conditional-create
    const attResp = await startRegistration({ optionsJSON: json.authOpts }).catch((error) => {
        console.error(error); // TODO error on page
    });

    const res2 = await fetch("/api/auth/verify-reg", {
        method: "POST",
        body: JSON.stringify({
            userId: json.userId,
            authOpts: attResp
        })
    });
    if (res2.status !== 200) {
        console.error(await res2.text());
    }

}


export async function authPasskey() {

    const res = await fetch("/api/auth/authenticate");
    const json: any = await res.json();


    
    const attResp = await startAuthentication(json.authOpts).catch((error) => {
        console.error(error); // TODO error on page
    });

    const res2 = await fetch("/api/auth/verify-auth", {
        method: "POST",
        body: JSON.stringify({
            authOpts: attResp
        })
    });
    if (res2.status !== 200) {
        console.error(await res2.text());
    }

}