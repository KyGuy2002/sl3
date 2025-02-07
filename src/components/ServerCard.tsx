import { Card } from "@/components/ui/card";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import TagCardContent from "./TagCardContent";
import { Blocks, Circle, Copy, Drill, FerrisWheel, SwatchBook } from "lucide-react";
import type { ModeDetailsType, ServerCardDetails, ServerModeType, TagDetailsType } from "@/pages/api/server/utils";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { VARS } from "@/styles/vars";
  

export default function ServerCard(props: {
    data: ServerCardDetails,
    hideModeName?: boolean,
    interestedModeId?: string,
    interestedTagIds?: string[],
}) {

    const [displayedDetails, setDisplayedDetails] = useState<DisplayedDetailsType>(getDisplayedDetails());

    return (
        <a
            href={`/server/${props.data.id}`}
            className='flex-grow-0 cursor-pointer hover:scale-[1.008] transition-transform focus:scale-[1.1]'
            style={{minWidth: `${VARS.serverCardMinWidth}px`}}
        >
            <Card className='h-full hover:bg-gray-50 overflow-hidden'>

                {/* Banner Image */}
                <div className="h-0">
                    <div className="w-full h-[100px] relative">
                        <img src={props.data.bannerUrl || undefined} alt={`${props.data.name} Minecraft Server`}
                            className="absolute w-full h-full object-cover object-center"
                        />
                        <div className="absolute w-full h-full" style={{backgroundImage: 'linear-gradient(rgba(0,0,0,0), rgba(255,255,255,1))'}}></div>
                    </div>
                </div>

                <div className="relative p-[20px] pt-[70px]">
                    <div className='flex flex-row gap-4 items-center'>

                        <img src={props.data.logoUrl || undefined} alt={`${props.data.name} Minecraft Server Logo`} className="w-[55px] rounded-xl aspect-square object-cover"/>

                        <div className='m-0'>

                            <p className='font-bold text-[19px] m-0'>{props.data.name}</p>
                            <p className='group hover:gap-4 transition-transform ease-linear duration-200 text-gray-500 m-0 text-[14.5px] -mt-[2px] flex items-center gap-1.5 border-b-transparent border-b-[1px] h-4 hover:border-b-gray-400'>
                                {props.data.javaIp || props.data.bedrockIp}
                                {/* TODO show depending on filter/setting? */}
                                {/* TODO better hover and click animation */}
                                <Copy size={11} className="-mb-1 group-hover:scale-125" />
                            </p>

                        </div>




                    </div>
                    <div className='mt-3'>

                        {!props.hideModeName && <p className='text-gray-500 text-[13px] font-bold uppercase'>{displayedDetails.mode.details.name}</p>}

                        <p className='text-gray-600 text-[14px] font-[400] mb-3'>{displayedDetails.mode.cardDesc}</p>

                        <div className='grid grid-cols-2 gap-1.5 ml-[2px]'>
                            {displayedDetails.tags.map((t) => (

                                <p key={t.id} className={classNames('flex text-[14px] items-center gap-1 font-semibold', {
                                    ['text-gray-500']: props.interestedTagIds?.includes(t.id),
                                    ['text-gray-700']: !props.interestedTagIds?.includes(t.id),
                                })}>
                                    {getIcon(t.type)}
                                    {t.name}
                                </p>

                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </a>
    );

    function getDisplayedDetails() {
        const d = {} as DisplayedDetailsType;

        // Get Mode
        if (props.interestedModeId) d.mode = props.data.modes.filter((m) => m.details.id === props.interestedModeId)[0];
        else d.mode = props.data.modes[Math.floor(Math.random() * props.data.modes.length)];


        // Get tags that match the interested tag ids and fill the remaining space with other random tags
        const interested = props.interestedTagIds || [];
        
        // Get the ones we want
        const result = d.mode.tags.filter((t) => interested.includes(t.id));

        // Get the rest
        const notGotten = d.mode.tags.filter((t) => !interested.includes(t.id));

        // Loop remaining spaces (max - interested)
        const count = 6 - result.length;
        for (let i = 0; i < count; i++) {

            // If we ran out, just stop
            if (notGotten.length == 0) break;

            // Pick a random remaining tag
            const t = notGotten[Math.floor(Math.random() * notGotten.length)];

            // Add to result
            result.push(t);

            // Remove from notGotten
            notGotten.splice(notGotten.indexOf(t), 1);

        }

        d.tags = result;

        return d;
    }

}


export function getIcon(type: string) {
    switch (type) {
        case 'PLUGIN':
            return <Blocks size={12} className="-ml-[2px] mb-[1px]"/>;
        case 'STYLE':
            return <SwatchBook size={12} className="-ml-[2px]"/>;
        case 'FEATURE':
            return <FerrisWheel size={12} className="-ml-[2px]"/>;
        case 'TOOL':
                return <Drill size={12} className="-ml-[2px]"/>;
        default:
            return <Circle size={15} />;
    }
}


type DisplayedDetailsType = { mode: ServerModeType, tags: TagDetailsType[] };