import { Binoculars, Search, TextSearch } from 'lucide-react';
import LoginHeaderButton from './login/LoginHeaderButton';
import { Button } from './ui/button';

export default function Header() {
    return (
        <div className='bg-gray-900 text-white p-4 py-2.5 text-xl font-bold flex'>
            <a href='/' className='flex items-center gap-1 cursor-pointer'>
                MC Server List
            </a>

            <Button variant="header" className='ml-auto' asChild>
                <a href="/search">
                    <Binoculars strokeWidth={2.5} />
                    Find Another Server
                </a>
            </Button>

            <LoginHeaderButton/>
        </div>
    );
}