import { useState, useEffect, useRef } from 'react';
import { ArrowBigRight, ChevronLeft, ChevronRight, SearchIcon } from 'lucide-react';
import classNames from 'classnames';
import TagCardContent, { getColorConditions, getTagColor } from './TagCardContent';
import { Card } from './ui/card';
import type { TagDetailsType } from '@/pages/api/server/utils';
import { Button } from './ui/button';
import Chip, { ChipDivider, ChipBtn } from './Chip';

export default function ItemSearch(props: {
  defaultEndpoint: string,
  queryEndpoint: string,
  placeholder: string,
  onNext: (selected: TagDetailsType[]) => void,
  onlyOne?: boolean,
  allowSkip?: boolean,
  backBtn?: boolean,
  prevCategoryLabel?: string,
}) {

  const abortRef = useRef<AbortController>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typeaheadRef = useRef<string | undefined>(null);

  const [selected, setSelected] = useState<TagDetailsType[]>([]);

  const [data, setData] = useState<any>();
  const [typeahead, setTypeahead] = useState<string | undefined>();
  const [defData, setDefData] = useState<any>();

  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch(props.defaultEndpoint);
    const json: any = await response.json();
    setDefData(json);
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, [])

  useEffect(() => {
    typeaheadRef.current = typeahead;
  }, [typeahead])

  useEffect(() => {

    if (props.onlyOne && selected.length > 0) props.onNext(selected);

  }, [selected])

  useEffect(() => {
    abortRef.current = new AbortController();
    load();
  }, [])

  useEffect(() => {

    function handle(e: any) {
      if (e.key === 'Tab' && typeahead != undefined) {
        e.preventDefault();
        inputRef.current!.value = typeahead;
        searchChange(typeahead);
        setTypeahead(undefined);
      }
      if (e.key === 'Enter') select(getFirstItem())
    }

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [typeahead, data]);


  return (
    <div>


        <div className='mb-4 flex gap-2 items-center'>

          {props.backBtn && <>
            
            <ChipBtn name="Back" href="/search" type="back" className='bg-red-500 text-white hover:bg-red-600'/>

          </>}

          {props.prevCategoryLabel && <>

            <ChipDivider/>
          
            <Chip key={"mode"} name={props.prevCategoryLabel} hideX={true}/>

          </>}

          {selected.length > 0 && (props.backBtn || props.prevCategoryLabel) && <ChipDivider/>}

          {selected.map((item) => (

            <Chip key={item.id} name={item.name} onClose={() => remove(item)}/>

          ))}

        </div>


        <div className='flex gap-4 mb-1 align-stretch'>
        
          {/* NOTE: w-screen is used here instead of w-full because of negative margin */}
          <div className='w-screen -mx-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl p-1'>
            <div className='bg-gray-200 rounded-xl p-1'>
              <Card className='flex gap-2 items-center py-2 px-3 text-gray-500 outline outline-[2px] outline-transparent has-[:focus]:outline-black'>

                {!loading && <SearchIcon size={18}/>}

                {loading && <img src="/icons/spinner.svg" className='h-[18px] w-[17.5px]'/>}

                <div className='w-full relative'>
                  <input ref={inputRef} placeholder={props.placeholder} className='focus:outline-transparent w-full text-black'
                    onChange={(e) => searchChange(e.target.value)}
                  />

                  <div className='absolute top-0 text-gray-400 flex items-center'>
                    <span className='opacity-0'>{inputRef.current?.value}</span>
                    {typeahead?.slice(inputRef.current?.value.length)}
                    {typeahead && typeahead.toLowerCase() != inputRef.current?.value.toLowerCase() && <p
                      className='bg-gray-400 rounded-md text-[10px] font-bold text-white px-[5px] py-0.5
                      flex items-center gap-[0.5px] pr-[2.5px] w-max ml-1'
                    >
                      TAB
                      <ArrowBigRight size={15} strokeWidth={2.2}/>  
                    </p>}
                  </div>
                </div>

              </Card>
            </div>
          </div>

          {(!props.onlyOne || props.allowSkip) &&
            // NOTE: Needs to be INSIDE a div for some reason or else it doesnt stretch vertically...
            <div>
              <Button
                disabled={!props.allowSkip && selected.length == 0}
                className='max-w-[250px] min-w-[150px] w-[15vw] h-full rounded-2xl bg-green-600 hover:bg-green-700 font-semibold tracking-wide text-xl'
                // TODO does it actually prevent from clicking when disabled?
                onClick={() => props.onNext(selected)}
              >
                {props.allowSkip && selected.length == 0 ? 'Skip' : 'Next'}
                <ChevronRight strokeWidth={4}/>
              </Button>
            </div>
          }

        </div>


        {/* Results/ms text */}
        <p className='text-gray-500 text-xs mb-1 -mt-[2px] ml-4'>
          {data && <>{data.count} results in {data.times.total}ms {data.cached && <>(cached)</>}</>}
          {!data && <>Loading...</>}
        </p>
      

        {data && <>
        

          {/* Show error if all results are around the same rank */}
          {data && data.mode == "bad" && <>
            <p className='mt-4 text-center font-bold'>We couldn't find anything relevant</p>
            <p className='mb-4 text-center'>Check your spelling and try different keywords.</p>
          </>}

          {data.bestItems.length > 0 && <FilterFlex items={data.bestItems} highlight={true} gray={false} onClick={toggle}/>}

          {data.items.length > 0 && <FilterFlex items={data.items} highlight={false} gray={false} onClick={toggle}/>}

          {data.maybeItems.length > 0 && <>
            <p className='mt-5'>Maybe what you are looking for:</p>
            <FilterFlex items={data.maybeItems} highlight={false} gray={true} onClick={toggle}/>
          </>}


        </>}

    </div>
  )


  function getFirstItem() {
    return data && (data.bestItems[0] || data.items[0] || data.maybeItems[0]) || null;
  }


  function toggle(item: TagDetailsType) {
    if (selected.includes(item)) remove(item);
    else select(item);
  }


  function select(item: TagDetailsType) {
    if (!item) return;

    setSelected([...selected, item]);

    // Make user select all text in field (faster to restart typing)
    inputRef.current?.select();
  }


  function remove(item: TagDetailsType) {
    setSelected(selected.filter(i => i !== item));
  }


  async function searchChange(value: any) {

    if (!value || value === '' || value === ' ' || value.length == 0) {
      setData(defData);
      setTypeahead(undefined);
      return;
    }

    // if (!typeahead.toLowerCase().startsWith(e.target.value.toLowerCase())) setTypeahead(undefined);

    abortRef.current?.abort();

    abortRef.current = new AbortController();
    const signal = abortRef.current?.signal;

    query(value, signal);
    queryTypeahead(value, signal);
  }


  async function queryTypeahead(q: string, signal: AbortSignal) {

    let response;
    try {
      response = await fetch('/api/filters/modes/typeahead?q=' + q, { signal });
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.log(error)
      return;
    }

    let t: any = await response.json();
    setTypeahead(t.value); // Set to undefined if empty
  }


  async function query(q: string, signal: AbortSignal) {
    setLoading(true);

    let response;
    try {
      response = await fetch(props.queryEndpoint + q, { signal });
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.log(error)
      return;
    }

    setLoading(false);
    setData(await response.json());
  }


  function FilterFlex(localProps: { items: any, highlight: boolean, gray: boolean, onClick: (item: any) => void }) {
    return (
      <div className="flex flex-wrap gap-2">
        {localProps.items.map((item: any) => (
          <TagCard
            data={item}
            selected={selected.includes(item)}
            quickAdd={getFirstItem() === item && data != defData}
            grayed={localProps.gray}
            highlighted={localProps.highlight}
            onClick={() => localProps.onClick(item)}
            className={classNames('', {
              [getTagColor(item.type, true)]: selected.includes(item)
            })}
          />
        ))}
      </div>
    )
  }


}



export function TagCard(props: {
  data: TagDetailsType,
  selected: boolean,
  quickAdd: boolean,
  grayed: boolean,
  highlighted: boolean,
  onClick: () => void,
  className?: string,
}) {
  return (
    <Card key={props.data.id} className={classNames('relative px-4 py-2 cursor-pointer border-2 border-transparent hover:border-gray-400 grow flex flex-col justify-between ' + props.className, {
      'hover:bg-gray-50': !props.selected,  
      'opacity-[0.7]': props.grayed,
        'outline outline-1 outline-gray-700': props.highlighted,
        'outline outline-[3.5px] outline-gray-400': props.quickAdd,
      })}
      onClick={props.onClick}
    >
      <TagCardContent key={props.data.id} data={props.data}/>

      {props.quickAdd && <p
        className='absolute right-1 bottom-1 bg-gray-400 rounded-md text-[10px] font-bold text-white px-[5px] py-0.5
        flex items-center gap-[0.5px] pr-[2.5px]'
      >
        ENTER
        <ArrowBigRight size={15} strokeWidth={2.2}/>  
      </p>}

    </Card>
  )
}