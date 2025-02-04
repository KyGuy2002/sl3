import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import TagCardContent from "../TagCardContent";
import { getIcon } from "../ServerCard";
import { Button } from "../ui/button";
import { BookText, Globe, Mail, ShoppingBasket } from "lucide-react";
import Markdown from 'react-markdown'


// TODO use astro nano stores or something to display page with partial data from card while full data is loading.
export default function Server(props: {id: string}) {


  const [ fullData, setFullData ] = useState<any>();

  useEffect(() => {

    handle();
    async function handle() {

      const res = await fetch(`/api/server/${props.id}`);
      setFullData(await res.json());

    }

  }, [])



  return (
    <div className="bg-gray-200 p-4 flex flex-col items-center">


      {/* Center column */}
      <div className='max-w-[1200px]'>

        {fullData && <>
        

          <img src={fullData.bannerUrl} alt={`${fullData.name} Minecraft Server`} className="h-[100px] w-full object-cover object-center rounded-xl"/>

          <Card className="mt-2">
            <div className="p-4">



              <div className="flex gap-4 mb-4 items-center">

                <img src={fullData.logoUrl} alt={`${fullData.name} Minecraft Server Logo`} className="w-[65px] rounded-xl aspect-square object-cover"/>

                <div>
                  <h1 className="text-4xl font-bold">{fullData.name}</h1>
                  <p className="text-gray-500 text-xl font-semibold">{fullData.ip}</p>
                </div>

              </div>


              <div className="flex gap-[8px]">

                <Button className=""><Globe/> Website</Button>

                <Button className=""><Mail/>Contact</Button>

                <Button className="">
                  <BookText />
                  Rules
                </Button>

                {/* <Button className="">
                  <ShoppingBasket />
                  Store
                </Button> */}

                <Button className="bg-discord hover:bg-discord-hover">
                  <img src="/icons/discord.svg" className='h-4 svg-white'/>
                  Discord
                </Button>

                {/* <Button className="bg-[#E1306C] hover:bg-discord-hover">
                  <img src="/icons/instagram.svg" className='h-4 svg-white'/>
                  Instagram
                </Button>

                <Button className="bg-[#FF0000] hover:bg-discord-hover">
                  <img src="/icons/youtube.svg" className='h-4 svg-white'/>
                  YouTube
                </Button>

                <Button className="bg-black">
                  <img src="/icons/x.svg" className='h-4 svg-white'/>
                  Twitter/X
                </Button>

                <Button className="bg-[#1877F2] hover:bg-discord-hover">
                  <img src="/icons/facebook.svg" className='h-4 svg-white'/>
                  Facebook
                </Button>

                <Button className="bg-[#2af0ea] text-black hover:bg-discord-hover">
                  <img src="/icons/tiktok.svg" className='h-4'/>
                  TikTok
                </Button> */}

              </div>

            </div>


          </Card>

          <Card className="mt-2">
            <div className="p-4">

              <p className="text-gray-500 text-xl font-semibold markdown-style"><Markdown>{fullData.desc}</Markdown></p>
              </div>


            </Card>

          {fullData.modes.map((mode: any) => 

            <>
              <h1 className="text-4xl font-bold mb-1 mt-4">Creative</h1>


              <div className="grid gap-2 grid-cols-2">
                <Card>
                  <div className="p-4">

                    <p className="text-gray-500 text-xl font-semibold markdown-style"><Markdown>{mode.fullDesc}</Markdown></p>

                  </div>
                </Card>

                <Card>
                  <div className="p-4">

                    <div className='grid grid-cols-2 gap-1.5 ml-[2px]'>
                        {mode.tags.slice(0, 6).map((tag: any) => (

                            <HoverCard>
                                {/* TODO remove capitalize style */}
                                <HoverCardTrigger>
                                    <p key={tag} className="flex font-semibold text-black text-lg items-center gap-2 capitalize">
                                        {getIcon("STYLE")}
                                        {tag}
                                    </p>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    <TagCardContent data={JSON.parse('{"id":"01949634-5616-77e0-be7a-912c4d9d94f1","name":"WorldEdit","desc":"An easy-to-use in-game world editor.","modeId":"01949633-064a-76ed-872d-5c531080990a","type":"PLUGIN","aka":["FAWE","WE","Editor"]}')}/>
                                </HoverCardContent>
                            </HoverCard>
                        ))}
                    </div>

                  </div>
                </Card>

              </div>

            </>

          )}
        

        </>}

      </div>


    </div>
  )
}
    