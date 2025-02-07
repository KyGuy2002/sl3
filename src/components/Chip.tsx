import { ArrowRightLeft, ChevronLast, ChevronLeft, Plus, RotateCcw, X } from "lucide-react";
import { Card } from "./ui/card";
import classNames from "classnames";

export default function Chip(props: {
    name: string,
    onClose?: () => void,
    hideX?: boolean,
}) {
    return (
        <Card className={classNames("flex items-center gap-1.5 px-4 py-0.5 group", {
            'cursor-pointer': !props.hideX,
        })} onClick={props.onClose}>
            <p className=" font-medium text-[15px]">{props.name}</p>
            {!props.hideX &&
                <X size={18} strokeWidth={2} className='-mr-[6px] cursor-pointer group-hover:stroke-[2.7px]'/>
            }
        </Card>
    )
}


export function ChipBtn(props: {
    name: string,
    href?: string,
    onClick?: () => void,
    type: "back" | "start-over" | "swap" | "plus"
    className?: string,
}) {
    return (
        <a
            className={'flex items-center gap-1.5 px-4 py-0.5 cursor-pointer rounded-xl shadow transition-all ' + props.className}
            href={props.href}
            onClick={props.onClick}
        >

            {props.type == "back" && <ChevronLeft size={17} strokeWidth={2} className="-ml-[5px]"/>}

            <p className="font-medium text-[15px]">{props.name}</p>

            {props.type == "start-over" && <RotateCcw size={14} strokeWidth={3} className="ml-[2px] -mr-[2px]"/>}
            {props.type == "swap" && <ArrowRightLeft size={14} strokeWidth={3} className="ml-[2px] -mr-[2px]"/>}
            {props.type == "plus" && <Plus size={14} strokeWidth={3} className="ml-[2px] -mr-[2px]"/>}

        </a>
    )
}


export function ChipDivider() {
    return (
        <hr className='w-[2px] h-[22px] bg-gray-400'/>
    )
}