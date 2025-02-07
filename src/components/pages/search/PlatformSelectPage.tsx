import ItemSearch, { TagCard } from '../../ItemSearch';
import PageTitle from './PageTitle';
import { HighlightCard } from './utils';


export default function PlatformSelectPage() {
  return (
    <>

      <PageTitle
        title='Select Platform'
        desc={<>
          Let us know which <HighlightCard text='Platform' className="bg-gray-400"/> you're using to get started.
        </>}
      />

      <div className='grid gap-2 grid-cols-2 max-w-[900px]'>

        <TagCard
          data={{name: 'Java Edition', id: 'java', desc: 'Minecraft Java Edition is primarily for PC (Windows, Mac, Linux).', type: 'JAVA', aka: []}}
          onClick={() => next('java')}
          quickAdd={false}
          selected={false}
          grayed={false}
          highlighted={false}
        />

        <TagCard
          data={{name: 'Bedrock Edition', id: 'java', desc: 'Minecraft Bedrock Edition offers cross-platform play on Consoles, Mobile, and PC.', type: 'BEDROCK', aka: []}}
          onClick={() => next('bedrock')}
          quickAdd={false}
          selected={false}
          grayed={false}
          highlighted={false}
        />

      </div>

    </>
  )
}


function next(p: string) {
  localStorage.setItem("platform", p);
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("platform", p);
  window.location.href = '/results?' + searchParams.toString();
}