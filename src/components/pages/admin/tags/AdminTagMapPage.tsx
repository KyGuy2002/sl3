import { useEffect, useState } from 'react';
import type { ModeDetailsType, TagDetailsType } from '@/pages/api/server/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import SearchSelect from './SearchSelect';

export default function AdminTagMapPage() {

  const [theirs, setTheirs] = useState<any>({});
  const [tags, setTags] = useState<TagDetailsType[]>();
  const [modes, setModes] = useState<ModeDetailsType[]>();
  const [mapping, setMapping] = useState<any>({});
  
  async function load() {
    const response = await fetch('/api/filters/modes');
    const response2 = await fetch('/api/filters/tags');
    const response3 = await fetch('/api/filters/foreignTags');
    const response4 = await fetch('/api/filters/mappings');

    const json: any = await response.json();
    const json2: any = await response2.json();
    const json3: any = await response3.json();
    const json4: any = await response4.json();

    setTags(json2.items);
    setModes(json.items);
    setTheirs(json3);
    setMapping(json4);
  }

  useEffect(() => {
    load();
  }, [])


  async function save() {

    // Add to db
    await fetch('/api/filters/mappings', {
      method: 'POST',
      body: JSON.stringify(mapping),
    });

  }


  if (!modes || !tags) return <h1>Loading...</h1>

  return (
    <>

      <h1 className='text-3xl font-bold mb-4'>Edit Tag Mappings</h1>

      {/* TODO: pb-20 is temp */}
      <div className='max-w-[800px] pb-20'>

        <Button
          variant='destructive'
          className='max-w-[800px] w-full mb-4 fixed bottom-0 z-10'
          onClick={save}
        >
          Save <Save/>
        </Button>

        {Object.keys(theirs).map((name) => 
        
          <Card key={name} className='p-4 mb-4'>

            <h3 className='text-xl font-semibold text-gray-700'>{name}</h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Their Tag</TableHead>
                  <TableHead>Our Tag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {theirs[name].map((tag: any) => 
                  <TableRow key={tag.id}>
                    <TableCell>
                      <p className='font-bold'>{tag.name}</p>
                      <p className='text-xs'>{tag.description}</p>
                    </TableCell>
                    <TableCell>

                      <SearchSelect
                        valueId={(mapping[name][tag.id])}
                        valueLabel={tags.find((t) => t.id == mapping[name][tag.id])?.name || modes.find((t) => t.id == mapping[name][tag.id])?.name || "Select..."}
                        onChange={(v) => {

                          const newMapping = { ...mapping };
                          if (!newMapping[name]) newMapping[name] = {};
                          newMapping[name][tag.id] = v;
                          setMapping(newMapping);
  
                        }}
                      />

                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

          </Card>

        )}

      </div>
        

    </>
  )
}