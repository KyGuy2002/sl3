import { Search, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import ServerCard from '../ServerCard';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import PresetCard from '../PresetCard';

export default function HomePage() {


  const [data, setData] = useState<any[][]>();
  
    async function load() {
      const response = await fetch('/api/server/all');

  
      setData(await response.json());
    }
  
    useEffect(() => {
      load();
    }, [])


  return (
    <>


        {/* Featured Filters */}
        <div className='grid gap-4 grid-cols-4'>

          <PresetCard
            name="Creative Servers"
            desc='Click to filter'
            href="/results?mode=01949633-064a-76ed-872d-5c531080990a"
            image="/images/temp/1.png"
          />

          <PresetCard
            name="Survival Servers"
            desc='Click to filter'
            href="/results?mode=01949635-ff1c-748d-826f-91117fa99a8d"
            image="/images/temp/2.png"
          />

          <PresetCard
            name="PvP Servers"
            desc='Click to filter'
            href="/results?mode=019496a6-3825-79ce-9e5f-0f78de5e27c1"
            image="/images/temp/3.png"
          />

          <PresetCard
            name="Minigame Servers"
            desc='Click to filter'
            href="/results?mode=019496a5-5327-74f0-bde7-28cf374f8f46"
            image="/images/temp/6.png"
          />

        </div>


        {/* Search Section */}
        <div className='mt-4 py-16'>

          <h1 className='text-5xl font-extrabold flex items-center justify-center'>
            
            <div className='px-5 py-1 bg-red-400 font-semibold text-white rounded-full flex items-center gap-2'>
              <Search size={40} strokeWidth={3} />
              Find
            </div>

            <div className='text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 p-2'>
              Millions
            </div>
            of Servers
          </h1>

          <a className='mx-auto mt-4 max-w-[700px] block -m-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl p-1' href="/search">
            <div className='bg-gray-200 rounded-xl p-1'>
              <Card className='flex gap-2 items-center justify-center py-2 px-3 text-gray-500 outline outline-[2px] outline-transparent has-[:focus]:outline-black'>

                <SearchIcon size={18}/>

                <p className=''>Start Searching</p>

              </Card>
            </div>
          </a>

        </div>

        
        


        <h1 className='text-3xl font-bold mb-3 mt-8 flex gap-3 items-center'>
          Featured Servers
          <span className='bg-gray-300 border-2 border-gray-400 px-3 py-1 rounded-full text-sm mt-1 cursor-pointer'>View All</span>
        </h1>

        <div className="flex gap-4">
            
          {data && data.slice(0, 4).map((item: any) => (
              <ServerCard key={item.id} data={item}/>
          ))}

        </div>

        <h1 className='text-3xl font-bold mb-3 mt-8 flex gap-3 items-center'>
          Recently Added
          <span className='bg-gray-300 border-2 border-gray-400 px-3 py-1 rounded-full text-sm mt-1 cursor-pointer'>View All</span>
        </h1>

        <div className="flex gap-4">
            
          {data && data.slice(5, 9).map((item: any) => (
              <ServerCard key={item.id} data={item}/>
          ))}

        </div>

    </>
  )
}