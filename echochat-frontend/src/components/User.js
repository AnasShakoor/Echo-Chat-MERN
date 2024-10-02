import { React, useState, useContext, useEffect } from 'react'
import EchoContext from "../context/EchoContext";
import { useNavigate,Link } from 'react-router-dom';


function User() {
    const echo = useContext(EchoContext)
    const { getUsers,updatereceiverInfo } = echo;
    const [users, setUsers, showAlert] = useState([])
    const navigate =  useNavigate();

    useEffect(() => {

        try {
            async function fetchData() {

                const user = await getUsers();
                setUsers(user)
            }
            fetchData();

        } catch (error) {
            showAlert(error)

        }
         if(!localStorage.getItem("token")){
            navigate("/login")
         }
    }, [])

    return (
        <>

<div className="container">
  <div className="row mt-4">
    {users.map((user) => (
      <div key={user._id} className="col-md-4 mt-4">  {/* 3 cards per row on medium screens */}
        <div className="card" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">{user.name}</h5>
            <p className="card-text">{user.email}</p>
            
            <Link to="/chat-box"  onClick={()=>{
              localStorage.setItem('receiver',JSON.stringify(user))
            }} className="btn btn-dark">Lets Chat</Link>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
        </>
    )
}

export default User
