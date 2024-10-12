"use client"

import GoogleAddress from "@/app/_components/GoogleAddress";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner"
import {Loader} from "lucide-react"
import { useRouter } from "next/navigation";




const AddListing = () => {

    const[selectedAddress,setSelectedAddress] = useState()
    const[coordinates,setCoordinates] = useState()
    const[loader,setLoader] = useState(false)

    const {user} = useUser()
    const router = useRouter()

    const handleNext= async()=>{
        setLoader(true)
        console.log(selectedAddress,coordinates)
        
        const { data, error } = await supabase
        .from('listings')
        .insert([
        { 
            address: selectedAddress.label, 
            coordinates: coordinates,
            createdBy:user?.primaryEmailAddress.emailAddress
        },

        ])
        .select();

        if(data){
            setLoader(false)
            toast("Success",{
                description: "New address has been added",
            })
            // uses table id created from supabase to add as a dynamic
            // route for the edit-listing page
            router.replace('edit-listing/'+data[0].id)
        }
        if(error){
            setLoader(false)
            toast("Error adding address")

            
        }
        

    }

    return (
        <div className="mt-10 md:mx-56 lg:mx-80">
            <div className='p-10 flex flex-col gap-5 items-center justify-center'>
                <h2 className='font-bold text-2xl'>Add a new listing</h2>
                <div className="p-5 w-full rounded-lg border shadow-md flex flex-col gap-5">
                    <h2 className='text-gray-500'>Enter the address here</h2>
                    <GoogleAddress
                        selectedAddress={(value)=>setSelectedAddress(value)}
                        setCoordinates={(value)=>setCoordinates(value)}
                    />
                    <Button
                    disabled={!selectedAddress || !coordinates || loader}
                    onClick={handleNext}
                    >{loader?<Loader className="animate-spin"/>:'Next'}</Button>
                </div>
            </div>
        </div>
    )
}

export default AddListing
