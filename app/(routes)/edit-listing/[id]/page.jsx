"use client"
import { useState, useEffect } from 'react'

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Textarea } from "@/components/ui/textarea"

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Formik } from 'formik'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { toast } from "sonner"
import { Loader } from "lucide-react"
import { useUser } from '@clerk/nextjs'
import FileUpload from '../_components/FileUpload'




const EditListings = ({ params }) => {

    const [loader, setLoader] = useState(false)
    const [listing, setListing] = useState([])
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)

    // const params = usePathname()
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        // call this method when user info is available
        user && verifyUserRecords()
    }, [user])

    const verifyUserRecords = async () => {
        const { data, error } = await supabase
            .from('listings')
            .select("*,listingImages(listing_id,url)")
            .eq('createdBy', user?.primaryEmailAddress.emailAddress)
            .eq('id', params.id)

        if (data) {
            console.log(data);

            setListing(data[0])
        }

        if (data?.length <= 0) {
            router.replace('/')
        }
    }

    const onSubmitHandler = async (formValue) => {

        setLoader(true)
        const { data, error } = await supabase
            .from('listings')
            .update(formValue)
            .eq('id', params.id)
            .select()

        if (data) {
            setLoader(false)
            toast("Success", {
                description: "Information has been added",
            })
        }

        // uploading images to supabase bucket
        // iterating through each images
        for (const image of images) {
            setLoader(true)
            const file = image;
            const fileName = Date.now().toString();
            const fileExtension = fileName.split('.').pop()
            const { data, error } = await supabase.storage
                .from('listingimages')
                .upload(`${fileName}`, file, {
                    contentType: `image/${fileExtension}`,
                    upsert: false
                })

            if (error) {
                toast('error uploading images')
            }
            else {

                const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL + fileName
                const { data, error } = await supabase
                    .from('listingImages')
                    .insert([
                        { url: imageUrl, listing_id: params?.id }
                    ])
                    .select();
            }
            setLoader(false)

        }


        if (error) {
            setLoader(false)
            console.error('Error updating listing:', error.message);  // Log the error
            toast("Error adding info", { description: error.message });


        }

    }


    const publishBtnHandler = async(formValues)=>{
        
        const updatedValues = {
            ...formValues,
            active: true
        };
        setLoading(true)
        const { data, error } = await supabase
        .from('listings')
        .update(updatedValues)
        .eq('id',params?.id)
        .select()

        if(data){
            setLoading(false)
            toast('listing published')
        }

        if (error) {
            setLoading(false);
            console.error('Error publishing listing:', error.message);
            toast("Error publishing listing", { description: error.message });
        }
    }
    return (
        <div className="px-10 md:px-36 my-10">
            <h2 className="font-bold text-2xl">Give more details of Listings</h2>

            <Formik
                initialValues={{
                    type: '',
                    propertyType: '',
                    bedroom: '',
                    bathroom: '',
                    builtIn: '',
                    parking: '',
                    lotSize: '',
                    area: '',
                    price: '',
                    hoa: '',
                    description: '',
                    profileImage: user?.imageUrl,
                    fullName: user?.fullName
                }}
                onSubmit={(values) => {
                    console.log(values);
                    onSubmitHandler(values);

                }}
            >
                {({
                    values,
                    setFieldValue,
                    handleChange,
                    handleSubmit,
                }) => (
                    <form onSubmit={handleSubmit}>
                        {/* onValueChange={(v)=> values.type=v}  onValueChange={(e)=> values.propertyType=e} onValueChange={(v) => setFieldValue("type", v)}*/}
                        <div className="p-8 rounded-lg shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-lg text-slate-500">Rent or Sale</h2>
                                    <RadioGroup defaultValue={listing?.type} onValueChange={(v) => values.type = v} >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Rent" id="Rent" />
                                            <Label htmlFor="Rent">Rent</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Sale" id="Sale" />
                                            <Label htmlFor="Sale">Sale</Label>
                                        </div>
                                    </RadioGroup>

                                </div>
                                {/* SELECT PROPERTY */}
                                <div className='flex flex-col gap-2'>
                                    <h2 className="text-lg text-gray-500">Select Property Type</h2>
                                    <Select onValueChange={(e) => values.propertyType = e}
                                        defaultValue={listing?.propertyType}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={listing?.propertyType ? listing?.propertyType : 'select property'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Bangalow">Bangalow</SelectItem>
                                            <SelectItem value="Family House">Family House</SelectItem>
                                            <SelectItem value="Flat">Flat</SelectItem>
                                            <SelectItem value="Duplex">Duplex</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {/* lower form */}
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 gap-10'>
                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">Bedroom</h2>
                                    <Input type="number" onChange={handleChange}
                                        defaultValue={listing?.bedroom}
                                        placeholder="Ex.2" name="bedroom" />
                                </div>

                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">Bathroom</h2>
                                    <Input type="number" onChange={handleChange} placeholder="Ex.2"
                                        defaultValue={listing?.bathroom} name="bathroom" />
                                </div>


                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">Built In</h2>
                                    <Input placeholder="Ex.1900 Sq.ft" onChange={handleChange}
                                        defaultValue={listing?.builtIn} name="builtIn" />
                                </div>

                            </div>

                            {/* second lower form */}
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 gap-10'>
                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">Parking</h2>
                                    <Input type="number" placeholder="Ex.2" onChange={handleChange}
                                        defaultValue={listing?.parking} name="parking" />
                                </div>

                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">Lot size (Sq.ft)</h2>
                                    <Input type="number" placeholder="Ex.2" onChange={handleChange}
                                        defaultValue={listing?.lotSize} name="lotSize" />
                                </div>

                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">Area (Sq.ft)</h2>
                                    <Input type="number" placeholder="Ex.2"
                                        onChange={handleChange} defaultValue={listing?.area} name="area" />
                                </div>
                            </div>

                            {/* third lower form */}
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 gap-10'>
                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">Selling price (Naira)</h2>
                                    <Input type="number" placeholder="30000" onChange={handleChange}
                                        defaultValue={listing?.price}
                                        name="price" />
                                </div>

                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">HOA (Per Month) (Naira)</h2>
                                    <Input type="number" placeholder="39090" onChange={handleChange}
                                        defaultValue={listing?.hoa} name="hoa" />
                                </div>

                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">Area (Sq.ft)</h2>
                                    <Input type="number" placeholder="Ex.2" onChange={handleChange}
                                        defaultValue={listing?.area} name="area" />
                                </div>
                            </div>

                            {/* fourth lower form */}
                            <div className='grid grid-cols-1 mt-10 gap-10'>
                                <div className='flex gap-2 flex-col'>
                                    <h2 className="text-gray-500">Selling price (Naira)</h2>
                                    <Textarea placeholder="describe a bit about the property"
                                        onChange={handleChange} defaultValue={listing?.description} name="description" />
                                </div>
                            </div>

                            <div className='mt-6'>
                                <h2 className='text-lg text-gray-500 my-4'>Upload property images here</h2>
                                <FileUpload setImages={(value) => setImages(value)}
                                    imageList={listing?.listingImages} />
                            </div>

                            <div className='flex gap-7 mt-5 justify-end'>

                                <Button variant="outline">{loader ? <Loader className="animate-spin" /> : 'save'}</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                    <Button >{loading ? <Loader className="animate-spin" /> : 'save and publish'}</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you ready to publish?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will publish your listings
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => publishBtnHandler(values)} >
                                            {loading ? <Loader className="animate-spin" /> : 'Publish'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        </div>
    )
}

export default EditListings

