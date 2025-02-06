import { CardDescription, CardTitle } from "@/components/ui/card";
import type { TagDetailsType } from "@/pages/api/server/utils";
import classNames from "classnames";


export default function TagCardContent(props: { data: TagDetailsType & { score?: number } }) {
    return (
        <>
            {/* aka is not in wrapper div to allow component user to float it at the bottom (tags search flex) */}
            <div>
                <div className='flex items-center gap-2 mt-1 mb-0.5'>
                    <CardTitle>{props.data.name}</CardTitle>
                    <div className={classNames(`rounded-full px-[8px] text-[11px] font-bold uppercase pt-[2px]`, getColorConditions(props.data.type))}>
                        {props.data.type}
                    </div>
                    {props.data.score && <p className="ml-auto text-xs text-gray-500">{Math.round(props.data.score.toFixed(2) * 100)}%</p>}
                </div>

                <CardDescription className='text-[15px]'>{props.data.desc}</CardDescription>
            </div>

            <p className='text-sm mt-1'><b>aka.</b> {props.data.aka.join(", ")}</p>
        </>
    );
}


export function getColorConditions(type: string, light: boolean = false) {
    if (light) return {
        'bg-blue-100': type === 'PLUGIN',
        'bg-purple-100': type === 'STYLE',
        'bg-green-100': type === 'FEATURE',
        'bg-red-100': type === 'TOOL',
        'bg-gray-100': type === 'OTHER',
    }
    else return {
        'bg-blue-200': type === 'PLUGIN',
        'bg-purple-300': type === 'STYLE',
        'bg-green-300': type === 'FEATURE',
        'bg-red-300': type === 'TOOL',
        'bg-gray-300': type === 'OTHER',
    }
}


export function getTagColor(type: string, light: boolean = false) {
    if (light) switch(type) {
        case 'PLUGIN': return 'bg-blue-100';
        case 'STYLE': return 'bg-purple-100';
        case 'FEATURE': return 'bg-green-100';
        case 'TOOL': return 'bg-red-100';
        default: return 'bg-gray-100';
    }
    else switch(type) {
        case 'PLUGIN': return 'bg-blue-200';
        case 'STYLE': return 'bg-purple-300';
        case 'FEATURE': return 'bg-green-300';
        case 'TOOL': return 'bg-red-300';
        default: return 'bg-gray-300';
    }
}