export function HighlightCard(props: { text: string, className: string }) {
    return <span className={`rounded-full px-3 py-0 uppercase font-semibold text-lg ${props.className}`}>{props.text}</span>
}