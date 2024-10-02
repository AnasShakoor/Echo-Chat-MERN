import { React, useContext } from 'react'
import  EchoContext from "../context/EchoContext";

function Alert() {
    const echo = useContext(EchoContext)
    const { alert } = echo;
    return (

        alert.state && <div className="alert alert-primary " style={{ position: 'sticky', top: '0', zIndex: 1000 }} role="alert">
            {alert.message}
        </div>

    )
}

export default Alert
