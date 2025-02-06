import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import ItemSearch from '../ItemSearch';
import type { TagDetailsType } from '@/pages/api/server/utils';
import classNames from 'classnames';
import { getColorConditions, getTagColor } from '../TagCardContent';

export default function ModeSearchPage() {

  return (
    <>

      <h1 className='mt-8 text-4xl font-bold'>
        {getStepTitle(!!selectedGamemode)}
      </h1>
      <p className='text-2xl max-w-3xl mb-6'>
        {getStepDesc(!!selectedGamemode)}
      </p>

      
      {!selectedGamemode && <GamemodeSection />}

      {selectedGamemode && <TagsSection />}

    </>
  )




  function GamemodeSection() {
    return (
      <ItemSearch
        onNext={g => setSelectedGamemode(g[0])}
        onlyOne
        defaultEndpoint={`/api/filters/modes`}
        queryEndpoint={`/api/filters/modes/query?q=`}
        placeholder='Search for a gamemode'
      />
    )
  }


  function TagsSection() {
    return (
      <>
        <ItemSearch
          onNext={(t) => window.location.href = `/results?mode=${selectedGamemode!.id}&tags=${t.map(t => t.id).join(',')}`}
          allowSkip
          defaultEndpoint={`/api/filters/tags?modeId=${selectedGamemode!.id}`}
          queryEndpoint={`/api/filters/tags/query?modeId=${selectedGamemode!.id}&q=`}
          placeholder='Search for a tag'
        />


        <div className='fixed bottom-5 mx-auto inset-x-[500px]'>
          <Button variant="secondary" onClick={() => {
            setSelectedGamemode(undefined);
            setSelectedTags([]);
          }}>Start Over</Button>
        </div>
  
  
        </>
    )
  }







}


function getStepTitle(selectedGamemode: boolean) {
  if (selectedGamemode) return 'Step 2: Pick Features';
  else return 'Step 1: Select Game Mode';
}

function getStepDesc(selectedGamemode: boolean) {
  if (selectedGamemode) return <>
    Refine your search by filtering by <HighlightCard text='Plugins' className={getTagColor("PLUGIN")}/>, <HighlightCard text='Tools' className={getTagColor("TOOL")}/>, and <HighlightCard text='Styles' className={getTagColor("STYLE")}/> to find your perfect server.
  </>
  else return <>
    Begin by choosing a <HighlightCard text='Game mode' className="bg-gray-400"/> that matches your playstyle.
  </>
}

function HighlightCard(props: { text: string, className: string }) {
  return <span className={`rounded-full px-3 py-0 uppercase font-semibold text-lg ${props.className}`}>{props.text}</span>
}