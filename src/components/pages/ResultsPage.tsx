import { useState, useEffect } from 'react';
import ServerCard from '../ServerCard'; // Make sure to import ServerCard
import TagBubbleCard from '../TagBubbleCard';
import type { TagDetailsType } from '@/pages/api/server/utils';

export default function ResultsPage() {

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
          <h1 className="text-3xl font-bold">Showing Results For:</h1>
          <span className='font-bold'>Gamemode: </span> {modeDetails && modeDetails.name}

          <div className='mb-3 flex gap-2'>
          
            {tagDetails && tagDetails.map((item: any) => (
  
              <TagBubbleCard key={item.id} data={item} onClose={() => undefined}/>
  
            ))}
  
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
                />
              ))}
            </div>

          ))}

          {data == -1 &&
            <div className='mx-auto text-center mt-10'>
              <h3 className='text-xl font-medium'>No results found</h3>
              <p className='text-lg'>Try removing or swapping some filters</p>
            </div>
          }

        </div>

    </>
  )



  async function loadServers() {
    const modeId = new URLSearchParams(window.location.search).get("mode");
    const tagIds = new URLSearchParams(window.location.search).get("tags");
    const response = await fetch(`/api/server/search?mode=${modeId}&tags=${tagIds}`);

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