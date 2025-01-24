import { CardDescription, CardTitle } from "@/components/ui/card";
import cx from 'classnames';
import { Blocks, SwatchBook } from "lucide-react";


export default function TagCardContent(props: { data: TagType }) {
    return (
        <>
            {/* aka is not in wrapper div to allow component user to float it at the bottom (tags search flex) */}
            <div>
                <div className='flex items-center gap-2 mt-1 mb-0.5'>
                    <CardTitle>{props.data.name}</CardTitle>
                    <div className={'rounded-full px-[8px] text-[11px] font-bold uppercase w-max flex items-center gap-[2px] bg-' + getColorClass(props.data.type)}>
                        {props.data.type}
                    </div>
                </div>

                <CardDescription className='text-[15px]'>{props.data.desc}</CardDescription>
            </div>

            <p className='text-sm mt-1'><b>aka.</b> {props.data.aka.join(", ")}</p>
        </>
    );
}


export function getColorClass(type: string) {
    switch (type) {
        case 'PLUGIN':
            return 'blue-200';
        case 'STYLE':
            return 'purple-300';
        default:
            return 'gray-300';
    }
}


export function getLighterColorClass(type: string) {
    switch (type) {
        case 'PLUGIN':
            return 'blue-100';
        case 'STYLE':
            return 'purple-100';
        default:
            return 'gray-200';
    }
}


export type TagType = {
    name: string,
    desc: string,
    type: string,
    aka: string[]
}