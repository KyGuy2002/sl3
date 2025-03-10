import {
    Dialog,
    DialogContent,
    DialogTrigger,
  } from "@/components/ui/dialog"


import LoginDialog from "./LoginDialog";
import { Button } from "../ui/button";

export default function LoginHeaderButton() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" size="header" className='ml-4'><img src="/icons/passkey.svg"/>  Login</Button>
            </DialogTrigger>
            <DialogContent>
                <LoginDialog/>
            </DialogContent>
        </Dialog>
    );
}
