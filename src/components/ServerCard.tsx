import type { ServerCardDetails } from "@/pages/api/search";
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
        <a href={`/server/${props.data.id}`} className="flex-1 min-w-[300px] max-w-[400px] cursor-pointer hover:scale-[1.008] transition-transform focus:scale-[1.1]">
            <Card className='h-full hover:bg-gray-50'>
                <div className='flex flex-row gap-4 items-center p-6 pb-0'>

                    <img src={`/images/temp/mcbb.webp`} alt={`${props.data.name} Minecraft Server Logo`} className="w-[60px] rounded-xl aspect-square object-cover"/>

                    <div className='m-0'>

                        <p className='font-bold text-[19px] m-0'>{props.data.name}</p>
                        <p className='group hover:gap-4 transition-transform ease-linear duration-200 text-gray-500 m-0 text-[14.5px] -mt-1.5 flex items-center gap-1.5 border-b-transparent border-b-[1px] h-4 hover:border-b-gray-400'>
                            {props.data.ip}
                            {/* TODO better hover and click animation */}
                            <Copy size={11} className="-mb-1 group-hover:scale-125" />
                        </p>

                        <div className='bg-green-600 w-[60px] h-[3px] mt-[3px]'/>

                    </div>




                </div>
                <div className='p-6 pt-3'>
                    <p className='text-gray-500'>{props.data.modeCardDesc}</p>

                    <div className='grid grid-cols-2 gap-1'>
                        {props.data.tags.slice(0, 6).map((tag) => (

                            <HoverCard>
                                {/* TODO remove capitalize style */}
                                <HoverCardTrigger><p key={tag} className="flex font-semibold text-gray-700 items-center gap-1 capitalize">{getIcon("STYLE")} {tag}</p></HoverCardTrigger>
                                <HoverCardContent>
                                    <TagCardContent data={JSON.parse('{"id":"01949634-5616-77e0-be7a-912c4d9d94f1","name":"WorldEdit","desc":"An easy-to-use in-game world editor.","modeId":"01949633-064a-76ed-872d-5c531080990a","type":"PLUGIN","aka":["FAWE","WE","Editor"]}')}/>
                                </HoverCardContent>
                            </HoverCard>
                        ))}
                    </div>
                </div>
            </Card>
        </a>
    );
}


function getIcon(type: string) {
    switch (type) {
        case 'PLUGIN':
            return <Blocks size={12} className="-ml-[2px] mb-[1px]"/>;
        case 'STYLE':
            return <SwatchBook size={12} className="-ml-[2px]"/>;
        default:
            return <Blocks size={15} />;
    }
}