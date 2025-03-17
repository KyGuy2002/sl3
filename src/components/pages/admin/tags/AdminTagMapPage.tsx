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
import Chip from '@/components/Chip';
import type { MappingType } from '@/pages/api/filters/mappings/[site]';

export default function AdminTagMapPage() {

  const [tags, setTags] = useState<TagDetailsType[]>();
  const [modes, setModes] = useState<ModeDetailsType[]>();
  const [mapping, setMapping] = useState<MappingType[]>([]);
  
  async function load() {
    const response = await fetch('/api/filters/modes');
    const response2 = await fetch('/api/filters/tags');
    const response3 = await fetch('/api/filters/mappings/findmcserver.com');

    const json: any = await response.json();
    const json2: any = await response2.json();
    const json3: any = await response3.json();

    setTags(json2.items);
    setModes(json.items);
    setMapping(json3);
  }

  useEffect(() => {
    load();
  }, [])


  async function save() {

    // Add to db
    await fetch('/api/filters/mappings/findmcserver.com', {
      method: 'POST',
      body: JSON.stringify(mapping),
    });

  }


  if (!modes || !tags) return <h1>Loading...</h1>

  return (
    <>

      <h1 className='text-3xl font-bold mb-4'>Edit Tag Mappings</h1>

      {/* TODO: pb-20 is temp */}
      <div className='pb-20'>

        <Button
          variant='destructive'
          className='w-full mb-4 fixed bottom-0 z-10'
          onClick={save}
        >
          Save <Save/>
        </Button>
        
        <Card className='p-4 mb-4'>

          <h3 className='text-xl font-semibold text-gray-700'>findmcserver.com</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Their Tag</TableHead>
                <TableHead>Our Tag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mapping.map((item) => 
                <TableRow key={item.id}>
                  <TableCell className='max-w-[150px]'>
                    <p className='font-bold'>{item.name}</p>
                    <p className='text-xs'>{item.description}</p>
                  </TableCell>
                  <TableCell>

                    {item.items.map((tag) =>
                      <Chip key={tag.id + item.id} name={tag.name} onClose={() => {
                        const newMapping = [ ...mapping ];

                        const newItem = newMapping.find((i) => i.id == item.id);
                        newItem!.items = newItem!.items.filter((t) => t.id != tag.id);

                        setMapping(newMapping);
                      }} />

                    )}

                    {/* If its a tag mapping OR if no items */}
                    {(item.items.length == 0 || (item.items[0] as TagDetailsType).modeId) &&
                      <SearchSelect
                        excludeModes={item.items.length > 0 && !!(item.items[0] as TagDetailsType).modeId}
                        hideIds={item.items.map((i) => i.id)} 
                        onAdd={(v) => {
                          const newMapping = [ ...mapping ];

                          const newItem = newMapping.find((i) => i.id == item.id);
                          newItem!.items.push(v as TagDetailsType);
  
                          setMapping(newMapping);
                        }}
                      />
                    }

                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

        </Card>

      </div>
        

    </>
  )
}