import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { createPasskey } from "./authUtils";



export default function LoginDialog() {

    async function create() {
        console.log("asd")
        await createPasskey("bob");
    }

    return (
        <>

            <form onSubmit={(e) => e.preventDefault()}>
                <p className="text-3xl font-semibold">Existing User</p>
                <p className="text-[15px] text-gray-500 font-[400]">Login with your passkey to continue.</p>
                <Button className="mt-3 w-full"><img src="/icons/passkey.svg" className='h-4 passkey-white'/>  Login with Passkey</Button>



                <p className="text-3xl font-semibold mt-8">Create an Account</p>
                <p className="text-[15px] text-gray-500 font-[400]">No email or password neccesary.  A username is all we need.</p>
                <Input className="mt-3 border-gray-700" placeholder="Display name (For your reference)"/>

                <button onClick={create}>hi</button>

                <Button className="mt-2 w-full"><img src="/icons/passkey.svg" className='h-4 passkey-white'
                    onClick={create}/>  Create a Passkey</Button>



                <Button variant="link" className="mx-auto block mt-4 -mb-3">What are Passkeys?</Button>
            </form>
        </>
    );
}