import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
  

export default function PresetCard(props: {
    name: string,
    desc: string,
    href: string,
    image: string
}) {
    return (
        <a href={props.href} className="cursor-pointer hover:scale-[1.01] transition-transform focus:scale-[1.1] grow">
            <Card className='overflow-hidden w-full'>

                <div className="px-[20px] py-3 flex items-center justify-between gap-10 bg-cover bg-center"
                    style={{
                        background: `linear-gradient(
                            to right, 
                            rgba(255, 255, 255, 1),
                            rgba(255, 255, 255, 0.9),
                            rgba(255, 255, 255, 0.6), 
                            rgba(0, 0, 0, 0)
                        ), url(${props.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}>

                {/* <div className="relative p-[20px] pt-[70px]"> */}
                    <div className="">
                        <p className="font-bold text-lg -mb-[5px]">{props.name}</p>
                        <p className="text-gray-500 font-semibold text-sm">{props.desc}</p>
                    </div>
                    <ChevronRight size={55} strokeWidth={1} className="-m-5"/>
                </div>

            </Card>
        </a>
    );
}