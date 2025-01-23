import LoginHeaderButton from './login/LoginHeaderButton';

export default function Header() {
    return (
        <div className='bg-gray-900 text-white p-4 py-2.5 text-xl font-bold flex'>
            MC Server List

            <LoginHeaderButton/>
        </div>
    );
}