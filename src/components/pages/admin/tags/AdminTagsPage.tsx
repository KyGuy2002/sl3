import { useEffect, useState } from 'react';
import type { ModeDetailsType, TagDetailsType } from '@/pages/api/server/utils';
import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getTagColor } from '@/components/TagCardContent';

export default function AdminTagsPage() {

  const [tags, setTags] = useState<TagDetailsType[]>();
  const [modes, setModes] = useState<ModeDetailsType[]>();
  
  async function load() {
    const response = await fetch('/api/filters/modes');
    const response2 = await fetch('/api/filters/tags');

    const json: any = await response.json();
    const json2: any = await response2.json();

    setTags(json2.items);
    setModes(json.items);
  }

  useEffect(() => {
    load();
  }, [])


  async function save() {

    // Add to db
    await fetch('/api/filters', {
      method: 'POST',
      body: JSON.stringify({ tags, modes }),
    });

  }


  if (!modes || !tags) return <h1>Loading...</h1>

  return (
    <>

      <h1 className='text-3xl font-bold mb-4'>Edit Tags</h1>

      <div className='max-w-[800px]'>

        <Button
          variant='destructive'
          className='max-w-[800px] w-full mb-4 fixed bottom-0'
          onClick={save}
        >
          Save <Save/>
        </Button>

        <Button
          className='w-full'
          onClick={() => {
            const updatedModes = [...modes];
            updatedModes.unshift({
              id: crypto.randomUUID(),
              name: `New Mode ${modes.length + 1}`,
              desc: "This is a placeholder!",
              aka: []
            })
            setModes(updatedModes);
          }}
        >
          Add Mode <Plus/>
        </Button>

        {modes.map((m, i) =>
          <div key={m.id}>

            <Card className='p-4 mt-4'>

              <input className='text-lg font-semibold' value={m.name} onChange={(e) => {
                const updatedModes = [...modes];
                updatedModes[i].name = e.target.value;
                setModes(updatedModes);
              }} />

              <input className='w-full block' value={m.desc} onChange={(e) => {
                const updatedModes = [...modes];
                updatedModes[i].desc = e.target.value;
                setModes(updatedModes);
              }} />

              <input className='w-full block text-sm mt-1 font-medium' value={m.aka.join(",")} onChange={(e) => {
                const updatedModes = [...modes];
                updatedModes[i].aka = e.target.value.replaceAll(", ", ",").split(",");
                setModes(updatedModes);
              }} />

            </Card>

            <div className='flex flex-col gap-2 mt-2'>

              <Button className='ml-10' onClick={() => {
                const updatedTags = [...tags];
                updatedTags.unshift({
                  id: crypto.randomUUID(),
                  name: `New Tag ${tags.length + 1}`,
                  desc: "This is a placeholder!",
                  type: "PLUGIN",
                  modeId: m.id,
                  aka: []
                })
                setTags(updatedTags);
              }}>Add Tag <Plus/></Button>

              {tags.filter((t) => t.modeId == m.id).map((t) =>
                <Card className='p-4 border-2 border-gray-600 ml-10' key={t.id}>

                  <div className='flex justify-between'>

                    <input className='text-lg font-semibold' value={t.name} onChange={(e) => {
                      const updatedTags = [...tags];
                      updatedTags[tags.indexOf(tags.find(b => b.id == t.id)!)].name = e.target.value;
                      setTags(updatedTags);
                    }} />

                    <select className={'rounded-full text-sm font-semibold px-3 ' + getTagColor(t.type)} value={t.type}
                      onChange={(e) => {
                        const updatedTags = [...tags];
                        updatedTags[tags.indexOf(tags.find(b => b.id == t.id)!)].type = e.target.value;
                        setTags(updatedTags);
                      }}
                    >
                      {['PLUGIN', 'FEATURE', 'STYLE', 'TOOL'].map((type) =>
                        <option key={type} value={type}>{type}</option>
                      )}
                    </select>

                  </div>

                  <input className='w-full block' value={t.desc} onChange={(e) => {
                    const updatedTags = [...tags];
                    updatedTags[tags.indexOf(tags.find(b => b.id == t.id)!)].desc = e.target.value;
                    setTags(updatedTags);
                  }} />

                  <input className='w-full block text-sm mt-1 font-medium' value={t.aka.join(",")} onChange={(e) => {
                    const updatedTags = [...tags];
                    updatedTags[tags.indexOf(tags.find(b => b.id == t.id)!)].aka = e.target.value.replaceAll(", ", ",").split(",");
                    setTags(updatedTags);
                  }} />


                </Card>
              )}

            </div>

          </div>
        )}
      </div>
        

    </>
  )
}