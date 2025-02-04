import type { ServerCardDetails } from "@/pages/api/server/search";
import { Card } from "@/components/ui/card";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import TagCardContent from "./TagCardContent";
import { Blocks, Copy, SwatchBook } from "lucide-react";
  

export default function ServerCard(props: { data: ServerCardDetails }) {
    return (
        <a href={`/server/${props.data.id}`} className="flex-grow-0 min-w-[300px] cursor-pointer hover:scale-[1.008] transition-transform focus:scale-[1.1]">
            <Card className='h-full hover:bg-gray-50 overflow-hidden'>

                {/* Banner Image */}
                <div className="h-0">
                    <div className="w-full h-[100px] relative">
                        <img src={props.data.bannerUrl} alt={`${props.data.name} Minecraft Server`}
                            className="absolute w-full h-full object-cover object-center"
                        />
                        <div className="absolute w-full h-full" style={{backgroundImage: 'linear-gradient(rgba(0,0,0,0), rgba(255,255,255,1))'}}></div>
                    </div>
                </div>

                <div className="relative p-[20px] pt-[70px]">
                    <div className='flex flex-row gap-4 items-center'>

                        <img src={props.data.logoUrl} alt={`${props.data.name} Minecraft Server Logo`} className="w-[55px] rounded-xl aspect-square object-cover"/>

                        <div className='m-0'>

                            <p className='font-bold text-[19px] m-0'>{props.data.name}</p>
                            <p className='group hover:gap-4 transition-transform ease-linear duration-200 text-gray-500 m-0 text-[14.5px] -mt-[2px] flex items-center gap-1.5 border-b-transparent border-b-[1px] h-4 hover:border-b-gray-400'>
                                {props.data.ip}
                                {/* TODO better hover and click animation */}
                                <Copy size={11} className="-mb-1 group-hover:scale-125" />
                            </p>

                        </div>




                    </div>
                    <div className='mt-3'>
                        <p className='text-gray-600 text-[14px] font-[400] mb-3'>{props.data.modeCardDesc}</p>

                        <div className='grid grid-cols-2 gap-1.5 ml-[2px]'>
                            {props.data.tags.slice(0, 6).map((tag) => (

                                <HoverCard>
                                    {/* TODO remove capitalize style */}
                                    <HoverCardTrigger>
                                        <p key={tag} className="flex font-semibold text-gray-700 text-[14px] items-center gap-1 capitalize">
                                            {getIcon("STYLE")}
                                            {tag}
                                        </p>
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                        <TagCardContent data={JSON.parse('{"id":"01949634-5616-77e0-be7a-912c4d9d94f1","name":"WorldEdit","desc":"An easy-to-use in-game world editor.","modeId":"01949633-064a-76ed-872d-5c531080990a","type":"PLUGIN","aka":["FAWE","WE","Editor"]}')}/>
                                    </HoverCardContent>
                                </HoverCard>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </a>
    );
}


export function getIcon(type: string) {
    switch (type) {
        case 'PLUGIN':
            return <Blocks size={12} className="-ml-[2px] mb-[1px]"/>;
        case 'STYLE':
            return <SwatchBook size={12} className="-ml-[2px]"/>;
        default:
            return <Blocks size={15} />;
    }
}