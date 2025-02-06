import { Binoculars, Pencil, PenSquare, Search, TextSearch, Trash2 } from 'lucide-react';
import LoginHeaderButton from './login/LoginHeaderButton';
import { Button } from './ui/button';

export default function HeaderButtons() {

    if (window.location.pathname === '/results') return (
        <>
            <Button variant="secondary" size="header" className='ml-auto rounded-r-none mr-1' asChild>
                <a href="/search">
                    <PenSquare strokeWidth={2.5} />
                    Revise Search
                </a>
            </Button>

            <Button variant="destructive" size="header" className='text-white rounded-l-none' asChild>
                <a href="/search">
                    <Trash2 strokeWidth={2.5} />
                    Start Over
                </a>
            </Button>
        </>
    );

    else return <>
        <div className='ml-auto flex gap-12'>
            <Button variant="link" size="headerLink" className='text-white' asChild>
                <a href="popular">
                    Most Popular
                </a>
            </Button>
            
            <Button variant="link" size="headerLink" className='text-white' asChild>
                <a href="popular">
                    Recently Added
                </a>
            </Button>
        </div>
    </>
}