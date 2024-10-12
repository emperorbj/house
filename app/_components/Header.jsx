"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"
import logo from "../assets/loginlogo.png"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {UserButton, useUser} from '@clerk/nextjs'


const Header = () => {
    const path = usePathname()
    const {user,isSignedIn} = useUser()
    return (
        <div className="p-6 px-10 flex justify-between shadow-sm fixed top-0 w-full z-10 bg-white">
            <div className="flex gap-12 items-center">
                <Image src={logo} width={150} height={150} alt="logo"/>
                <ul className="hidden md:flex gap-10">
                    <Link href={'/'}>
                        <li className={`font-medium text-sm hover:text-primary ${path === '/' && 'text-primary'}`}>For Sale</li>
                    </Link>
                    <li className="font-medium text-sm hover:text-primary">For Rent</li>
                    <li className="font-medium text-sm hover:text-primary">Find Agent</li>
                </ul>
            </div>
            <div className="flex gap-2 items-center">
                <Link href={'/add-listing'}>
                    <Button className="flex gap-2"><Plus className="h-5 w-5"/>Add a property</Button>
                </Link>
                {
                    isSignedIn ?
                    <UserButton/>
                    :
                    <Link href={'/sign-in'}>
                        <Button variant="outline">Login</Button>
                    </Link>
                }
                
            </div>
        </div>
    )
}

export default Header
