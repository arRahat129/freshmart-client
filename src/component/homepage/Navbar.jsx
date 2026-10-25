import React from 'react';
import logo_png from '@/assets/images/freshmart_logo.jpg'
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@heroui/react';

const Navbar = () => {
    return (
        <div className='flex justify-between w-full'>
            <div className='px-5'>
                <Image
                    src={logo_png}
                    alt='freshmart_logo'
                    width={50}
                    height={50}
                    className='w-full h-full'
                />
            </div>
            <div></div>
            <div className='flex gap-3'>
                <Avatar>
                    <AvatarImage>Avatar Image</AvatarImage>
                    <AvatarFallback>Avatar FallBack</AvatarFallback>
                </Avatar>
                <Button variant='danger'>Logout</Button>
            </div>
        </div>
    );
};

export default Navbar;