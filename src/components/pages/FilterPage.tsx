import { useState, useEffect } from 'react';
import ServerCard from '../ServerCard'; // Make sure to import ServerCard
import { ChevronRight, Search, SearchIcon, X } from 'lucide-react';
import { Card, CardDescription, CardTitle } from '../ui/card';
import TagCard, { getColorClass, getLighterColorClass, type TagType } from '../TagCard';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@radix-ui/react-hover-card';
import TagCardContent from '../TagCard';
import { Button } from '../ui/button';
import classNames from 'classnames';

export default function FilterPage() {

  const [data, setData] = useState<{}[]>();

  async function load() {
    const response = await fetch('/api/tags/modes');
    setData(await response.json());
  }

  useEffect(() => {
    load();
  }, [])


  const [selected, setSelected] = useState<TagType[]>([]);


  return (
    <div className="bg-gray-200 p-4 h-full">
      
      <h1 className='text-5xl font-extrabold mt-14 flex items-center justify-center'>
        
        <div className='px-5 py-1 bg-red-300 text-white rounded-full flex items-center gap-2'>
          <Search size={40} strokeWidth={3} />
          Find
        </div>

        <div className='text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 p-2'>
          Millions
        </div>
        of Servers
      </h1>


      <div className='p-4 mt-10 mx-20'>


        <div className='mb-2 flex gap-2'>

          {selected.map((item) => (

            <HoverCard>
              <HoverCardTrigger>
                <div className={'flex items-center gap-0.5 rounded-full w-max px-4 py-0.5 border border-gray-400 bg-' + getColorClass(item.type)}>
                  {/* Removes the tag */}
                  <p className='mb-[2px]'>{item.name}</p>
                  <X size={18} strokeWidth={1.5} className='-mr-[6px] cursor-pointer hover:stroke-[2.5px]'
                    onClick={() => remove(item)}/>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <TagCardContent data={item}/>
              </HoverCardContent>
            </HoverCard>

          ))}

        </div>
        

        {/* <Input placeholder='Search for a server' className='w-full mb-2'/> */}

        <Card className='flex gap-2 items-center py-2 px-3 text-gray-500 mb-2 outline outline-[2px] outline-transparent has-[:focus]:outline-black'>

          <SearchIcon size={18}/>

          <input placeholder='Search for a Gamemode' autoFocus className='focus:outline-transparent w-full text-black'/>

        </Card>
      


        <div className="flex flex-wrap gap-2">
          {data && data.map((item: any) => (
            <Card className={classNames('px-4 py-2 cursor-pointer hover:bg-gray-50 border-2 border-transparent hover:border-gray-400 grow flex flex-col justify-between', {
              [`bg-${getLighterColorClass(item.type)} border-${getColorClass(item.type)}`]: selected.includes(item)
            })}
              onClick={() => select(item)}>
              <TagCard key={item.id} data={item}/>
            </Card>
          ))}
        </div>

      </div>



      <Button className='bg-green-600 fixed bottom-5 mx-auto inset-x-[500px]'>Next Step <ChevronRight/></Button>

      

    </div>
  )


  function select(item: TagType) {
    setSelected([...selected, item]);


  }


  function remove(item: TagType) {
    setSelected(selected.filter(i => i !== item));
  }


}