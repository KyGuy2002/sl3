import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import type { ModeDetailsType, TagDetailsType } from "@/pages/api/server/utils";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";



export default function SearchSelect(props: {
    hideIds: string[]
    excludeModes: boolean,
    onAdd: (item: TagDetailsType | ModeDetailsType) => void,
}) {

    const [ open, setOpen ] = useState(false);

    const [ res, setRes ] = useState<any>();

    const abortRef = useRef<AbortController>(null);


    useEffect(() => {

        if (!open) {
            setRes(undefined);
        }

        function handle(e: KeyboardEvent) {
            if (e.key !== 'Enter') return;
            if (res && res.bestItems.length > 0) {
                console.log('enter2');
                props.onAdd(res.bestItems[0]);
                setOpen(false);
            }
        }

        if (open) window.addEventListener('keyup', handle);

        else window.removeEventListener('keyup', handle);

    }, [open]);
 

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild><Button size="icon"><Plus/></Button></PopoverTrigger>
            <PopoverContent>

                <Input
                    placeholder="Search..."
                    onChange={(e) => {
                        search(e.target.value)
                    }}
                />

                <div>

                    {!res && <p>Search to begin.</p>}

                    {res && res.bestItems.map((r: any, i: number) => (
                        <Row
                            id={r.id}
                            isMode={!r.modeId}
                            key={r.id}
                            name={r.name}
                            className={(i == 0 ? "border-2 border-gray-400 bg-gray-200 font-semibold" : "")}
                            onClick={() => {
                                props.onAdd(r);
                                setOpen(false);
                            }}
                        />
                    ))}

                    {(res && res.items.length > 0) && <div className="h-2"/>}

                    {res && res.items.slice(0, 4).map((r: any) => (
                        <Row
                            id={r.id}
                            key={r.id}
                            name={r.name}
                            onClick={() => {
                                props.onAdd(r);
                                setOpen(false);
                            }}
                        />
                    ))}

                    {(res && res.maybeItems.length > 0) && <div className="h-2"/>}

                    {res && res.maybeItems.slice(0, 4).map((r: any) => (
                        <Row
                            id={r.id}
                            key={r.id}
                            name={r.name}
                            onClick={() => {
                                props.onAdd(r);
                                setOpen(false);
                            }}
                        />
                    ))}

                </div>

            </PopoverContent>
        </Popover>
    )


    async function search(term: string) {

        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const signal = abortRef.current?.signal;

        async function go1() {
            const r = await fetch(`/api/filters/tags/query?q=${term}`, { signal });
            const json = await r.json();
            return json;
        }

        async function go2() {
            if (props.excludeModes) return { bestItems: [], items: [], maybeItems: [] };
            const r = await fetch(`/api/filters/modes/query?q=${term}`, { signal });
            const json = await r.json();
            return json;
        }

        const [ tags, modes ]: [ any, any ] = await Promise.all([go1(), go2()]);

        const obj = {
            bestItems: [ ...tags.bestItems, ...modes.bestItems ],
            items: [ ...tags.items, ...modes.items ],
            maybeItems: [ ...tags.maybeItems, ...modes.maybeItems ],
        }

        // Remove items that are already in the list
        obj.bestItems = obj.bestItems.filter((e: any) => !props.hideIds.includes(e.id));
        obj.items = obj.items.filter((e: any) => !props.hideIds.includes(e.id));
        obj.maybeItems = obj.maybeItems.filter((e: any) => !props.hideIds.includes(e.id));

        setRes(obj);

    }
}


function Row(props: {
    id: string,
    isMode: boolean,
    name: string,
    onClick: () => void,
    className?: string
}) {
    return (
        <div
            className={`flex gap-1 items-center bg-gray-100 px-3 py-0.5 cursor-pointer rounded-md my-1 hover:bg-gray-200 ${props.className}`}
            key={props.id}
            onClick={props.onClick}
        >
            {props.isMode && <div className="bg-black text-white text-xs rounded-md px-1.5 py-0.5">M</div>}
            {props.name}
        </div>
    )
}