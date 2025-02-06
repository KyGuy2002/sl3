import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import classNames from "classnames";
import { X } from "lucide-react";
import TagCardContent, { getColorConditions } from "./TagCardContent";
import { Card } from "./ui/card";
import type { TagDetailsType } from "@/pages/api/server/utils";

export default function TagBubbleCard(props: {
    data: TagDetailsType,
    onClose: () => void,
}) {
    return (
        <HoverCard>
            <HoverCardTrigger>

                <Card className="flex items-center gap-1.5 px-4 py-0.5">
                    <p className=" font-medium text-[15px]">{props.data.name}</p>
                    <X size={18} strokeWidth={2} className='-mr-[6px] cursor-pointer hover:stroke-[2.5px]'
                        onClick={props.onClose}
                    />
                </Card>

            </HoverCardTrigger>
            <HoverCardContent>
                <TagCardContent data={props.data}/>
            </HoverCardContent>
        </HoverCard>
    )
}