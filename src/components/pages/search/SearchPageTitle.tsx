export default function SearchPageTitle(props: {title: string, desc: any}) {
return (
    <>
        <h1 className='mt-8 text-4xl font-bold'>{props.title}</h1>

        <p className='text-2xl max-w-3xl mb-6'>{props.desc}</p>
    </>
)
}