import { React, useState, useContext, useEffect } from 'react'
import EchoContext from "../context/EchoContext";
import { useNavigate, Link } from 'react-router-dom';


function User() {
  const echo = useContext(EchoContext)
  const { getUsers, countUnreadMessages } = echo;
  const [countUnread, setCountUnread] = useState({})
  const [users, setUsers] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    try {
      async function fetchData() {
        const users = await getUsers();
        setUsers(users)

        const loggedInUser = JSON.parse(localStorage.getItem("logged_in_user"));
        
        const newCountUnread = {};
        
        for (const user of users) {
          const unreadCount = await countUnreadMessages(user._id, loggedInUser._id);
          // console.log(unreadCount)
          newCountUnread[user._id] = Number(unreadCount);; // Use user._id as the key

        }
        setCountUnread(newCountUnread);
        console.log(countUnread)
      }
      fetchData();
    } catch (error) {
      console.log(error)
    }
    if (!localStorage.getItem("token")) {
      navigate("/login")
    }
  }, [])

  return (
    <>

      <div className="container">

        <div className="row mt-4">
          {users.map((user) => (


            <div key={user._id} className="col-md-4 mt-4">
              <div style={{
                position: "relative",
                borderRadius: "50%",
                top: "1rem",
                left: "18rem",
                transform: "translateX(-50%)",
                zIndex: 1,
                color: "white",
                width: "1.7rem",
                height: "1.7rem",
                fontSize: "0.9rem",
                backgroundColor: "black",
                lineHeight: "1.7rem",
                textAlign: "center"
              }}>
  {Number(countUnread[user._id])} {/* Convert to number, fallback to 0 */}
  </div>
              <div className="card" style={{ width: "18rem" }}>
                <div className="card-body">
                  <h5 className="card-title">{user.name}</h5>
                  <p className="card-text">{user.email}</p>

                  <Link to="/chat-box" onClick={() => {
                    localStorage.setItem('receiver', JSON.stringify(user))
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
