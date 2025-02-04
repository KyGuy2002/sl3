import { useState, useEffect, useRef } from 'react';
import { ArrowBigRight, SearchIcon, X } from 'lucide-react';
import classNames from 'classnames';
import TagCardContent, { getColorConditions, type TagType } from './TagCardContent';
import { Card } from './ui/card';
import TagCard from './BubbleCard';
import TagBubbleCard from './TagBubbleCard';

export default function ItemSearch(props: {
    onSelectOne?: (item: TagType) => void,
    selected: TagType[],
    setSelected: (items: TagType[]) => void,
    defaultEndpoint: string,
    queryEndpoint: string,
    placeholder: string,
}) {

  const abortRef = useRef<AbortController>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<any>();
  const [typeahead, setTypeahead] = useState<any>();
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
    abortRef.current = new AbortController();
    load();
  }, [])

  useEffect(() => {

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && typeahead) {
        e.preventDefault();
        if (!inputRef.current) return;
        inputRef.current.value = typeahead;
        setTypeahead(undefined);
      }
    });

  });


  return (
    <div>


        <div className='mb-3 flex gap-2'>

          {props.selected.map((item) => (

            <TagBubbleCard data={item} onClose={() => remove(item)}/>

          ))}

        </div>


        <div className='mb-1 -m-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl p-1'>
          <div className='bg-gray-200 rounded-xl p-1'>
            <Card className='flex gap-2 items-center py-2 px-3 text-gray-500 outline outline-[2px] outline-transparent has-[:focus]:outline-black'>

              {!loading && <SearchIcon size={18}/>}

              {loading && <img src="/icons/spinner.svg" className='h-[18px] w-[17.5px]'/>}

              <div className='w-full relative'>
                <input ref={inputRef} placeholder={props.placeholder} autoFocus className='focus:outline-transparent w-full text-black'
                  onChange={searchChange}
                  onKeyDown={(e) => e.key === 'Enter' && select(getFirstItem())}
                />

                <div className='absolute top-0 text-gray-400 flex items-center'>
                  <span className='opacity-0'>{inputRef.current?.value}</span>
                  {typeahead?.slice(inputRef.current?.value.length)}
                  {typeahead && <p
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

          {data.bestItems.length > 0 && <FilterFlex items={data.bestItems} highlight={true} gray={false} onClick={select}/>}

          {data.items.length > 0 && <FilterFlex items={data.items} highlight={false} gray={false} onClick={select}/>}

          {data.maybeItems.length > 0 && <>
            <p className='mt-5'>Maybe what you are looking for:</p>
            <FilterFlex items={data.maybeItems} highlight={false} gray={true} onClick={select}/>
          </>}


        </>}

    </div>
  )


  function getFirstItem() {
    return data.bestItems[0] || data.items[0] || data.maybeItems[0] || null;
  }


  function select(item: TagType) {
    if (!item) return;

    if (props.onSelectOne) {
        props.onSelectOne(item);
        return;
    }

    props.setSelected([...props.selected, item]);

    // Make user select all text in field (faster to restart typing)
    inputRef.current?.select();
  }


  function remove(item: TagType) {
    props.setSelected(props.selected.filter(i => i !== item));
  }


  async function searchChange(e: any) {

    if (!e.target.value || e.target.value === '' || e.target.value === ' ' || e.target.value.length == 0) {
      setData(defData);
      setTypeahead(undefined);
      return;
    }

    // if (!typeahead.toLowerCase().startsWith(e.target.value.toLowerCase())) setTypeahead(undefined);

    abortRef.current?.abort();

    abortRef.current = new AbortController();
    const signal = abortRef.current?.signal;

    query(e.target.value, signal);
    queryTypeahead(e.target.value, signal);
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

    let t = await response.text();
    if (!t) return;

    t = t.replaceAll('"', '')
    setTypeahead(t);
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
          <Card className={classNames('relative px-4 py-2 cursor-pointer hover:bg-gray-50 border-2 border-transparent hover:border-gray-400 grow flex flex-col justify-between', {
              'opacity-[0.7]': localProps.gray,
              'outline outline-1 outline-gray-700': localProps.highlight,
              'outline outline-[3.5px] outline-gray-400': getFirstItem() === item && data != defData,
              ...(props.selected.includes(item) ? getColorConditions(item.type, true) : {})
            })}
            onClick={() => localProps.onClick(item)}
          >
            <TagCardContent key={item.id} data={item}/>

            {getFirstItem() === item && data != defData && <p
              className='absolute right-1 bottom-1 bg-gray-400 rounded-md text-[10px] font-bold text-white px-[5px] py-0.5
              flex items-center gap-[0.5px] pr-[2.5px]'
            >
              ENTER
              <ArrowBigRight size={15} strokeWidth={2.2}/>  
            </p>}

          </Card>
        ))}
      </div>
    )
  }


}