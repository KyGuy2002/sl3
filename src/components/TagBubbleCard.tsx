import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import classNames from "classnames";
import { X } from "lucide-react";
import TagCardContent, { getColorConditions, type TagType } from "./TagCardContent";

export default async function TagBubbleCard(props: {
    data: TagType,
    onClose: () => void,
}) {
    return (
        <HoverCard>
            <HoverCardTrigger>
                <div className={classNames('flex items-center gap-0.5 rounded-full w-max px-4 py-0.5 border border-gray-400 bg-', getColorConditions(props.data.type))}>
                    {/* Removes the tag */}
                    <p className='mb-[2px]'>{props.data.name}</p>
                    <X size={18} strokeWidth={1.5} className='-mr-[6px] cursor-pointer hover:stroke-[2.5px]'
                    onClick={props.onClose}/>
                </div>
            </HoverCardTrigger>
            <HoverCardContent>
                <TagCardContent data={props.data}/>
            </HoverCardContent>
        </HoverCard>
    )
}