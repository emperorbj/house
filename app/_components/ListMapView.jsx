"use client"
import {useEffect} from 'react'
import Listing from './Listing'
import { supabase } from '@/utils/supabase/client'


const ListMapView = ({type}) => {

    useEffect(()=>{
        getLatestListings()
    },[])

    const getLatestListings = async()=>{
        const {data,error} = await supabase
        .from('listings')
        .select('*,listingImages(url,listing_id)')
        .eq('active',true)
        .eq('type',type)

        if(data){
            console.log(data)
        }
    }
    return (
        <div className='grid grid-cols-1 md:grid-cols-2'>
            <div>
                <Listing />
            </div>
            <div>
                map
            </div>
        </div>
    )
}

export default ListMapView
