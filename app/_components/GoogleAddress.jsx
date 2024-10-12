"use client"
import { MapPin } from 'lucide-react';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';

const GoogleAddress = ({selectedAddress,setCoordinates}) => {
    return (
        <div className='flex items-center w-full'>
            <MapPin className='h-10 w-10 p-2 rounded-l-lg text-primary bg-orange-100'/>
            <GooglePlacesAutocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
                selectProps={{
                    placeholder:'search property',
                    isClearable:true,
                    className:"w-full",
                    onChange: (place) => {
                        console.log(place);
                        selectedAddress(place)
                        geocodeByAddress(place.label)
                        .then(result => getLatLng(result[0]))
                        .then(({lat,lng}) => {
                            // console.log(lat,lng)
                            setCoordinates({lat,lng})
                        })
                    }
                }}
            />
        </div>
    )
}

export default GoogleAddress
