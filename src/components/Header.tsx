import { Binoculars, Search, TextSearch } from 'lucide-react';
import LoginHeaderButton from './login/LoginHeaderButton';
import { Button } from './ui/button';

export default function Header() {
    return (
        <div className='bg-gray-900 text-white p-4 py-2.5 text-xl font-bold flex'>
            <div
                onClick={() => window.location.href = '/'}
                className='cursor-pointer'
            >MC Server List</div>

            <Button variant="header" className='ml-auto' onClick={() => window.location.href = "/search"}><Binoculars strokeWidth={2.5} /> Find Another Server</Button>

            <LoginHeaderButton/>
        </div>
    );
}