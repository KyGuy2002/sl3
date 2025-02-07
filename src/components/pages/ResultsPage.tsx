import { useState, useEffect } from 'react';
import ServerCard from '../ServerCard'; // Make sure to import ServerCard
import type { TagDetailsType } from '@/pages/api/server/utils';
import PageTitle from './search/PageTitle';
import Chip, { ChipDivider, ChipBtn } from '../Chip';
import { capitalizeFirstLetter } from '@/components/utils';
import { getTagColor } from '../TagCardContent';


export default function ResultsPage() {

  const platform = localStorage.getItem("platform");

  if (!platform || (platform != "java" && platform != "bedrock")) {
    window.location.href = '/search/platform' + window.location.search;
    return <></>;
  }

  return <Handle platform={platform}/>

}


function Handle(props: {platform: "java" | "bedrock"}) {

  const [data, setData] = useState<any[][] | -1>();
  const [modeDetails, setModeDetails] = useState<any>();
  const [tagDetails, setTagDetails] = useState<TagDetailsType[]>();

  useEffect(() => {
    loadServers();

    // TODO share this data from previous screen instead of fetching again
    // NOTE: This needs to be fetched seperatly in case no servers are returned, we still want to show the mode and tags at the top
    loadModeDetails();
    if (new URLSearchParams(window.location.search).get("tags")) loadTagDetails();
    else setTagDetails([]);
  }, [])



  return (
    <>

        <div className=''>
          <PageTitle
            title="Search Results"
            desc="Heres what we found for your search."
          />

          <div className='mb-3 -mt-4 flex gap-2 items-center'>

            <ChipBtn name="Start Over" href="/search" type="start-over" className='bg-red-500 text-white hover:bg-red-600 id-ref-start-over'/>

            <ChipDivider/>

            <ChipBtn key={"platform"} name={capitalizeFirstLetter(props.platform)} type="swap"
              className={(props.platform == "java" ?
                "bg-gray-300 border border-gray-400 text-black hover:bg-gray-300" :
                getTagColor(props.platform.toUpperCase()) + " hover:bg-green-700"
              )}
              onClick={() => {
                localStorage.setItem("platform", props.platform == "java" ? "bedrock" : "java");
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.set("platform", props.platform == "java" ? "bedrock" : "java");
                window.location.href = '/results?' + searchParams.toString();
              }}
            />

            {modeDetails && <>

              <ChipDivider/>

              <Chip key={"mode"} name={modeDetails.name} hideX={true} onClose={() => {
                // Make start over button shake
                document.querySelector('.id-ref-start-over')!.classList.add('animate-shake');
                setTimeout(() => document.querySelector('.id-ref-start-over')!.classList.remove('animate-shake'), 500);
              }}/>

            </>}

            {modeDetails && <ChipDivider/>}
          
            {tagDetails && tagDetails.map((item: any) => (
  
              <Chip key={item.id} name={item.name} onClose={() => removeTag(item.id)}/>
  
            ))}

            {modeDetails && <ChipBtn name="Add Tags" href={"/search/tags" + window.location.search + "&modeName=" + modeDetails.name} type="plus" className='border border-black bg-gray-200'/>}
  
          </div>

        </div>

        <div className="flex gap-4">

          {!data && <h3>Loading...</h3>}

          {data && data != -1 && data.map((col: any, i) => (
            
            <div key={i} className='flex gap-4 flex-col'>
              {col.map((item: any) => (
                <ServerCard
                  key={item.id}
                  data={item}
                  hideModeName={true}
                  interestedModeId={new URLSearchParams(window.location.search).get("mode") || undefined}
                  interestedTagIds={new URLSearchParams(window.location.search).get("tags")?.split(',')}
                  interestedPlatform={props.platform}
                  interestedPlayerCount={new URLSearchParams(window.location.search).get("sort")?.includes("players")}
                />
              ))}
            </div>

          ))}

          {data == -1 &&
            <div className='mx-auto text-center mt-20'>
              <h3 className='text-xl font-medium'>No results found</h3>
              <p className='text-lg'>Try removing or swapping some filters</p>
            </div>
          }

        </div>

    </>
  )


  function removeTag(tagId: string) {
    const tagIds = new URLSearchParams(window.location.search).get("tags")?.split(',');
    const newTagIds = tagIds?.filter((id) => id != tagId);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("tags", newTagIds!.join(','));

    window.location.search = searchParams.toString();
  }



  async function loadServers() {
    const modeId = new URLSearchParams(window.location.search).get("mode");
    const tagIds = new URLSearchParams(window.location.search).get("tags");
    const sort = new URLSearchParams(window.location.search).get("sort");
    const response = await fetch(`/api/server/search?mode=${modeId}&tags=${tagIds}&platform=${props.platform}&sort=${sort}`);

    // Split data into 3 cols
    const json: any = await response.json();

    if (json.length == 0) {
      setData(-1);
      return;
    }

    const newData: {}[][] = [[], [], []];
    let currentCol = 0;
    for (const s of json) {
      newData[currentCol].push(s);
      currentCol = (currentCol + 1) % 3;
    }

    setData(newData);
  }

  async function loadModeDetails() {
    const id = new URLSearchParams(window.location.search).get("mode");
    const response = await fetch(`/api/filters/modes?id=${id}`);

    const json: any = await response.json();

    setModeDetails(json.items[0]);
  }

  async function loadTagDetails() {
    const ids = new URLSearchParams(window.location.search).get("tags");
    const response = await fetch(`/api/filters/tags?ids=${ids}`);

    const json: any = await response.json();

    setTagDetails(json.items);
  }


}