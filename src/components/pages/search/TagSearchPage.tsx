import ItemSearch from '../../ItemSearch';
import { getTagColor } from '../../TagCardContent';
import SearchPageTitle from './SearchPageTitle';
import { HighlightCard } from './utils';


export default function TagSearchPage() {
  const mode = new URLSearchParams(window.location.search).get('mode');

  if (!mode || mode == 'undefined' || mode == 'null' || mode == '') {
    window.location.href = '/search';
    return <></>;
  }

  return <Comp modeId={mode}/>
}


function Comp(props: {modeId: string}) {
  return (
    <>

      <SearchPageTitle
        title='Step 2: Pick Features'
        desc={<>
          Refine your search by filtering by <HighlightCard text='Plugins' className={getTagColor("PLUGIN")}/>, <HighlightCard text='Tools' className={getTagColor("TOOL")}/>, and <HighlightCard text='Styles' className={getTagColor("STYLE")}/> to find your perfect server.
        </>}
      />

      
      <ItemSearch
        onNext={(t) => window.location.href = `/results?mode=${props.modeId}&tags=${t.map(t => t.id).join(',')}`}
        allowSkip
        defaultEndpoint={`/api/filters/tags?modeId=${props.modeId}`}
        queryEndpoint={`/api/filters/tags/query?modeId=${props.modeId}&q=`}
        placeholder='Search for a tag'
      />

    </>
  )
}