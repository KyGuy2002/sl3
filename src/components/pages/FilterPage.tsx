import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { type TagType } from '../TagCardContent';
import { Button } from '../ui/button';
import ItemSearch from '../ItemSearch';

export default function FilterPage() {

  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [selectedGamemode, setSelectedGamemode] = useState<TagType>();

  return (
    <div className="bg-gray-200 p-4 min-h-full font-[prompt] px-20">
      
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

      {!selectedGamemode && <GamemodeSection />}

      {selectedGamemode && <TagsSection />}

      

    </div>
  )




  function GamemodeSection() {
    return (
      <div>


        <h1 className='text-4xl font-bold'>Step 1: Select Gamemode</h1>
        <p className='text-2xl max-w-3xl'>Minecraft allows infinitely many unique gamemodes and play styles.  Start by picking which one you're looking for.</p>
  
  
        <ItemSearch
          selected={[]}
          setSelected={() => {}}
          onSelectOne={g => setSelectedGamemode(g)}
          defaultEndpoint={`/api/filters/modes`}
          queryEndpoint={`/api/filters/modes/query?q=`}
        />
  
  
      </div>
    )
  }


  function TagsSection() {
    return (
      <div>


        <h1>Step 2: Pick Features</h1>
        <p>Plugins, gameplay styles, features, and everything in between.  Please select all the tags you want to search for.</p>
  
  
        <ItemSearch
          selected={selectedTags}
          setSelected={setSelectedTags}
          defaultEndpoint={`/api/filters/tags?modeId=${selectedGamemode!.id}`}
          queryEndpoint={`/api/filters/tags/query?modeId=${selectedGamemode!.id}&q=`}
        />


        <div className='fixed bottom-5 mx-auto inset-x-[500px]'>
          <Button variant="secondary" onClick={() => {
            setSelectedGamemode(undefined);
            setSelectedTags([]);
          }}>Start Over</Button>
          <Button className='bg-green-600'>Next Step <ChevronRight/></Button>
        </div>
  
  
      </div>
    )
  }







}