import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useRef, useState } from "react";



export default function SearchSelect(props: {
    valueId: string,
    valueLabel: string,
    onChange: (valueId: string) => void,
}) {

    const [ open, setOpen ] = useState(false);

    const [ res, setRes ] = useState<any>();

    const abortRef = useRef<AbortController>(null);


    useEffect(() => {

        function handle(e: KeyboardEvent) {
            if (e.key !== 'Enter') return;
            if (res && res.bestItems.length > 0) {
                console.log('enter2');
                props.onChange(res.bestItems[0].id);
                setOpen(false);
            }
        }

        if (open) window.addEventListener('keyup', handle);

        else window.removeEventListener('keyup', handle);

    }, [open]);
 

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>{props.valueLabel || "Select..."}</PopoverTrigger>
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
                            name={r.name}
                            className={(i == 0 ? "border-2 border-gray-400 bg-gray-200 font-semibold" : "")}
                            onClick={() => {
                                props.onChange(r.id);
                                setOpen(false);
                            }}
                        />
                    ))}

                    {(res && res.items.length > 0) && <div className="h-2"/>}

                    {res && res.items.slice(0, 4).map((r: any) => (
                        <Row
                            id={r.id}
                            name={r.name}
                            onClick={() => {
                                props.onChange(r.id);
                                setOpen(false);
                            }}
                        />
                    ))}

                    {(res && res.maybeItems.length > 0) && <div className="h-2"/>}

                    {res && res.maybeItems.slice(0, 4).map((r: any) => (
                        <Row
                            id={r.id}
                            name={r.name}
                            onClick={() => {
                                props.onChange(r.id);
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
            const r = await fetch(`/api/filters/modes/query?q=${term}`, { signal });
            const json = await r.json();
            return json;
        }

        const [ tags, modes ]: [ any, any ] = await Promise.all([go1(), go2()]);

        setRes({
            bestItems: [ ...tags.bestItems, ...modes.bestItems ],
            items: [ ...tags.items, ...modes.items ],
            maybeItems: [ ...tags.maybeItems, ...modes.maybeItems ],
        });

    }
}


function Row(props: {
    id: string,
    name: string,
    onClick: () => void,
    className?: string
}) {
    return (
        <div
            className={`bg-gray-100 px-3 py-0.5 cursor-pointer rounded-md my-1 hover:bg-gray-200 ${props.className}`}
            key={props.id}
            onClick={props.onClick}
        >
            {props.name}
        </div>
    )
}