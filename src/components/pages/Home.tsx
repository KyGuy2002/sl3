import React, { useState, useEffect } from 'react';
import ServerCard from '../ServerCard'; // Make sure to import ServerCard

export default function Home() {

  const [data, setData] = useState<{}[]>();

  async function load() {
    const response = await fetch('/api/search?mode=creative&tags=npc');
    setData(await response.json());
  }

  useEffect(() => {
    load();
  }, [])

  return (
    <div className="bg-gray-200 p-4">
      <div className="flex flex-wrap gap-4">
        {data && data.map((item: any) => (
          <ServerCard key={item.id} data={item}/>
        ))}
      </div>
    </div>
  )
}