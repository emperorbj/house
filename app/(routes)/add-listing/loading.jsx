
import { FaSpinner } from 'react-icons/fa'
const loading = () => {
    return (
        <div className="flex items-center justify-center h-screen">
        <   FaSpinner className="animate-spin text-blue-500 text-5xl" />
        </div>
    )
}

export default loading
