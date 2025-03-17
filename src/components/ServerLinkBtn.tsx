import type { ServerLinkType } from "@/pages/api/server/utils";
import { buttonVariants } from "./ui/button";
import { Globe, Mail, Map, Video } from "lucide-react";

export default function ServerLinkBtn(props: ServerLinkType) {

    // NOTE: Make sure to update in ServerLinkType
    switch (props.type) {
        case "DISCORD": return <ImgLink className="bg-[#5865f2]! hover:bg-blue-600!"/>
        case "WEBSITE": return <Link><Globe/>Website</Link>
        case "MAP": return <Link><Map/>Map</Link>
        case "YOUTUBE": return <ImgLink className="bg-[#FF0000]! hover:bg-red-600!"/>
        case "EMAIL": return <Link><Mail/>Contact</Link>
        case "TWITTER": return <ImgLink className="bg-black"/>
        case "INSTAGRAM": return <ImgLink className="bg-[#E1306C]! hover:bg-pink-700!"/>
        case "TIKTOK": return <ImgLink className="bg-[#ff0050]! hover:bg-red-600!"/>
        case "FACEBOOK": return <ImgLink className="bg-[#3b5998]! hover:bg-blue-800!"/>
        case "TWITCH": return <ImgLink className="bg-[#9146ff]! hover:bg-purple-700!"/>
        case "BLUESKY": return <ImgLink className="bg-[#0886fe]! hover:bg-blue-600!"/>
        case "PATREON": return <ImgLink className=""/>
        case "TRAILER": return <Link className="bg-red-500! border-2 border-red-700!"><Video/>Watch Trailer</Link>
        case "PRIVACY": return <Link><Mail/>Privacy</Link>
        case "TERMS": return <Link><Mail/>Terms</Link>
        case "RULES": return <Link><Mail/>Rules</Link>
        case "STORE": return <Link><Mail/>Store</Link>
        default: return <Link><Globe/>{props.type}</Link>
    }



    function Link(localProps: {
        className?: string,
        children: React.ReactNode,
        imgOnly?: boolean,
    }) {

        let newLink;
        if (props.type == "EMAIL" && !props.url.startsWith("mailto:")) newLink = `mailto:${props.url}`;
        else if (props.type != "EMAIL" && !props.url.startsWith("http")) newLink = `https://${props.url}`;
        else newLink = props.url;

        return (
            <a
                className={`${buttonVariants({ size: (localProps.imgOnly ? "icon" : "default") })} ${localProps.className}`}
                href={newLink}
                target="_blank"
            >
                {localProps.children}
            </a>
        )
    }
    
    
    function ImgLink(localProps: {
        className?: string,
    }) {
        return (
            <Link className={localProps.className} imgOnly>
                <img src={`/icons/${props.type.toLowerCase()}.svg`} className='h-4 svg-white'/>
            </Link>
        )
    }
}