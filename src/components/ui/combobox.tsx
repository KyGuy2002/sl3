import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import classNames from "classnames"

export function Combobox(props: {
  placeholder: string,
  searchPrompt: string,
  value: string,
  setValue: (value: string) => void,
  items: { value: string, label: string }[],
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {props.value
            ? props.items.find((framework) => framework.value === props.value)?.label
            : props.placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={props.searchPrompt} />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {props.items.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    props.setValue(currentValue === props.value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className={classNames("", {
                    "bg-gray-300 font-semibold": framework.isMode,
                  })}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      props.value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    {framework.label}
                    {framework.parentName && <span className="font-bold text-[11px]">{framework.parentName}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
