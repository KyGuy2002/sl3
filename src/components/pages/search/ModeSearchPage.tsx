import ItemSearch from '../../ItemSearch';
import SearchPageTitle from './SearchPageTitle';
import { HighlightCard } from './utils';


export default function ModeSearchPage() {
  return (
    <>

      <SearchPageTitle
        title='Step 1: Select Game Mode'
        desc={<>
          Begin by choosing a <HighlightCard text='Game mode' className="bg-gray-400"/> that matches your playstyle.
        </>}
      />

      
      <ItemSearch
        onNext={g => window.location.href = `/search/tags?mode=${g[0].id}`}
        onlyOne
        defaultEndpoint={`/api/filters/modes`}
        queryEndpoint={`/api/filters/modes/query?q=`}
        placeholder='Search for a gamemode'
      />

    </>
  )
}