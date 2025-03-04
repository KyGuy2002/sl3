import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import TagCardContent, { getTagColor } from "../TagCardContent";
import { getIcon } from "../ServerCard";
import { Button } from "../ui/button";
import { Copy, MessageCircleWarning } from "lucide-react";
import Markdown from 'react-markdown'
import type { ServerCardDetails, ServerLinkType } from "@/pages/api/server/utils";
import classNames from "classnames";
import ServerLinkBtn from "../ServerLinkBtn";


// TODO use astro nano stores or something to display page with partial data from card while full data is loading.
export default function ServerDetailsPage(props: {id: string}) {


  const [ fullData, setFullData ] = useState<ServerCardDetails>();

  useEffect(() => {

    handle();
    async function handle() {

      const res = await fetch(`/api/server/${props.id}`);
      setFullData(await res.json());

    }

  }, [])



  return (
    <>

        <div className="h-[400px] absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(
              to bottom, 
              rgba(0, 0, 0, 0),
              rgba(229, 231, 235, 1)
            ), url(${fullData?.bannerUrl || undefined})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {fullData && <div className="relative z-10">

          <Card className="overflow-hidden">

            <div className="p-4">


              <div className="flex gap-4 mb-3 items-center">

                <img src={fullData.logoUrl} alt={`${fullData.name} Minecraft Server Logo`} className="w-[65px] rounded-xl aspect-square object-cover"/>

                <div>
                  <h1 className="text-4xl font-bold">{fullData.name}</h1>
                  <div className="text-gray-500 text-xl font-semibold flex items-center gap-3">
                    {fullData.javaIp &&
                      <div className="group cursor-pointer flex items-center gap-1.5">
                        <div className={"rounded-full px-2 text-sm -mr-0.25 " + getTagColor("JAVA")}>Java</div>
                        {fullData.javaIp}
                        <Copy size={14} className="-mb-[1px] group-hover:scale-125" />
                      </div>
                    }

                    {fullData.javaIp && fullData.bedrockIp && <span className="text-sm text-gray-400">or</span>}

                    {fullData.bedrockIp &&
                      <div className="group cursor-pointer flex items-center gap-1.5">
                        <div className={"rounded-full px-2 text-sm -mr-0.25 " + getTagColor("BEDROCK")}>Bedrock</div>
                        {fullData.bedrockIp}
                        <Copy size={14} className="-mb-[1px] group-hover:scale-125" />
                      </div>
                    }
                  </div>
                </div>

                <div className="ml-auto flex flex-col gap-0.25 items-end">

                  <div 
                    className={classNames('flex items-center gap-1.5 font-semibold', {
                      ['text-green-600']: fullData.online,
                      ['text-red-600']: !fullData.online,
                    })}
                  >
                    <div className={classNames('w-3 h-3 rounded-full mt-[1px]', {
                      ['bg-green-600']: fullData.online,
                      ['bg-red-600']: !fullData.online,
                    })}/>
                    {fullData.online ? `${fullData.onlinePlayers} Players` : "Offline"}
                  </div>

                  <div className="flex gap-1.5 items-center mt-2">

                    <span className="bg-gray-100 rounded-lg border-2 border-gray-300 px-1.5 font-semibold text-gray-600">{fullData.versionStart || "Unknown"}</span>

                    {fullData.versionEnd && <>
                      <hr className="w-2 border-t border-gray-400 border-2"/>
                      <span className="bg-gray-100 rounded-lg border-2 border-gray-300 px-1.5 font-semibold text-gray-600">{fullData.versionEnd}</span>
                    </>}

                  </div>

                </div>

              </div>


              <div className="flex gap-[8px]">

                {fullData.links.map((link: ServerLinkType) => (
                  <ServerLinkBtn
                    key={link.url}
                    type={link.type}
                    url={link.url}
                  />
                ))}

                <Button className="ml-auto border-2 border-red-600 bg-red-50 text-red-600 hover:bg-red-100">
                  <MessageCircleWarning />
                  Report Issue
                </Button>

              </div>

            </div>

          </Card>

          <Card className="mt-2">
            <div className="p-4">
              <div className="text-gray-500 text-xl font-semibold markdown-style"><Markdown>{fullData.desc}</Markdown></div>
              <div className="mt-[20px] text-gray-600 text-xs flex gap-8">
                <p>Last Updated: <span className="font-semibold text-black">{new Date(fullData.lastUpdated).toDateString()}</span></p>
                <p>Created: <span className="font-semibold text-black">{new Date(fullData.created).toDateString()}</span></p>
              </div>
            </div>
          </Card>

          {fullData.modes.map((mode: any) => 
            <div key={mode.details.id}>
              <h1 className="text-4xl font-bold mb-1 mt-5">{mode.details.name}</h1>
              <p>{mode.cardDesc}</p>


              <div className="grid gap-2 grid-cols-2">
                <Card>
                  <div className="p-4">

                    <div className="text-gray-500 text-xl font-semibold markdown-style"><Markdown>{mode.fullDesc}</Markdown></div>

                  </div>
                </Card>

                <Card>
                  <div className="p-4">

                    <div className='grid grid-cols-2 gap-1.5 ml-[2px]'>
                      {mode.tags.slice(0, 6).map((tag: any) => (

                        <HoverCard key={tag}>
                          {/* TODO remove capitalize style */}
                          <HoverCardTrigger>
                            <p className="flex font-semibold text-black text-lg items-center gap-2 capitalize">
                              {getIcon(tag.type)}
                              {tag.name}
                            </p>
                          </HoverCardTrigger>
                          <HoverCardContent>
                              <TagCardContent data={tag}/>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>

                  </div>
                </Card>

              </div>

            </div>
          )}

        </div>}

    </>
  )
}
    