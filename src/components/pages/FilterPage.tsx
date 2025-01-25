import { useState, useEffect, useRef } from 'react';
import { ArrowBigRight, ChevronRight, Search, SearchIcon, X } from 'lucide-react';
import { Card } from '../ui/card';
import TagCard, { getColorConditions, type TagType } from '../TagCardContent';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@radix-ui/react-hover-card';
import TagCardContent from '../TagCardContent';
import { Button } from '../ui/button';
import classNames from 'classnames';
import ItemSearch from '../ItemSearch';

export default function FilterPage() {

  const [selected, setSelected] = useState<TagType[]>([]);

  return (
    <div className="bg-gray-200 p-4 min-h-full">
      
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


      <ItemSearch
        selected={selected}
        setSelected={setSelected}
        defaultEndpoint='/api/tags?modeId=01949633-064a-76ed-872d-5c531080990a'
      />



      <Button className='bg-green-600 fixed bottom-5 mx-auto inset-x-[500px]'>Next Step <ChevronRight/></Button>

      

    </div>
  )


}