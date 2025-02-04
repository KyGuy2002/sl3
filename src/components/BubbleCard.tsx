import classNames from "classnames";
import { X } from "lucide-react";

export default async function BubbleCard(props: {
    name: string,
    color: any,
    onClose: () => void,
}) {
    return (
        <div className={classNames('flex items-center gap-0.5 rounded-full w-max px-4 py-0.5 border border-gray-400 bg-', props.color)}>
            {/* Removes the tag */}
            <p className='mb-[2px]'>{props.name}</p>
            <X size={18} strokeWidth={1.5} className='-mr-[6px] cursor-pointer hover:stroke-[2.5px]'
            onClick={props.onClose}/>
        </div>
    )
}