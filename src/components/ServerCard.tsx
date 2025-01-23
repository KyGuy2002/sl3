import type { ServerCardDetails } from "@/pages/api/search";
import { Card } from "@/components/ui/card";

export default function ServerCard(props: { data: ServerCardDetails }) {
    return (
        <a href={`/server/${props.data.id}`} className="flex-1 min-w-[300px] max-w-[400px] cursor-pointer hover:scale-[1.008] transition-transform focus:scale-[1.1]">
            <Card className='h-full hover:bg-gray-50'>
                <div className='flex flex-row gap-4 items-center p-6 pb-0'>

                    <img src={`/images/temp/mcbb.webp`} alt={`${props.data.name} Minecraft Server Logo`} className="w-[60px] rounded-xl aspect-square object-cover"/>

                    <div className='m-0'>

                        <p className='font-bold text-lg m-0'>{props.data.name}</p>
                        <p className='text-gray-500 m-0'>{props.data.ip}</p>

                        <div className='bg-green-600 w-[60px] h-[3.5px] m-0'/>

                    </div>




                </div>
                <div className='p-6 pt-3'>
                    <p className='text-gray-500'>{props.data.modeCardDesc}</p>

                    <div className='grid grid-cols-2 gap-1'>
                        {props.data.tags.slice(0, 6).map((tag) => (
                            <p key={tag}>X {tag}</p>
                        ))}
                    </div>
                </div>
            </Card>
        </a>
    );
}