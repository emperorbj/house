import Header from "./_components/Header"


const Provider = ({children}) => {
    return (
        <div>
            <Header/>
            <div className="mt-32"></div>
            {children}
        </div>
    )
}

export default Provider
