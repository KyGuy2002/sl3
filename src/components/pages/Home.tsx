import { useState, useEffect } from 'react';
import ServerCard from '../ServerCard'; // Make sure to import ServerCard
import TagBubbleCard from '../TagBubbleCard';

export default function Home() {

  const [data, setData] = useState<any[][]>();

  async function load() {
    const response = await fetch('/api/server/all');

    // split data into 3 cols
    const data: any[] = await response.json();
    const newData: {}[][] = [[], [], []];
    let currentCol = 0;
    for (const s of data) {
      newData[currentCol].push(s);
      currentCol = (currentCol + 1) % 3;
    }

    setData(newData);
  }

  useEffect(() => {
    load();
  }, [])

  return (
    <div className="bg-gray-200 p-4 flex flex-col items-center">

      {/* Center column */}
      <div className='max-w-[1200px]'>

        <div className=''>
          <h1 className="text-3xl font-bold">Showing Results For:</h1>
          <span className='font-bold'>Gamemode: </span> Creative

          <div className='mb-3 flex gap-2'>
          
            {[].map((item) => (
  
              <TagBubbleCard data={item} onClose={() => undefined}/>
  
            ))}
  
          </div>

        </div>

        <div className="flex gap-4">
          {data && data.map((col: any) => (
            
            <div className='flex gap-4 flex-col'>
              {col.map((item: any) => (
                <ServerCard key={item.id} data={item}/>
              ))}
            </div>

          ))}
        </div>

      </div>

    </div>
  )
}