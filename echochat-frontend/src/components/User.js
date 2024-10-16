import { React, useState, useContext, useEffect } from 'react';
import EchoContext from '../context/EchoContext';
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
const SOCKET_SERVER_URL = 'http://localhost:3000';
function User() {
  const echo = useContext(EchoContext);
  const { getUsers, countUnreadMessages, socket } = echo;
  const [countUnread, setCountUnread] = useState({});
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const trigger = () => {



  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getUsers();
        setUsers(users);

        const loggedInUser = JSON.parse(localStorage.getItem('logged_in_user'));

        const newCountUnread = {};

        for (const user of users) {
          if (loggedInUser) {
            const response = await countUnreadMessages(
              user._id,
              loggedInUser._id,
              loggedInUser._id
            );
            newCountUnread[user._id] = Number(response.unreadCount) || 0;
          }
        }
        setCountUnread(newCountUnread);
      } catch (error) {
        console.error(error);
        if (!localStorage.getItem('token')) {
          navigate('/login');
        }
      }
    };

    fetchData();



  }, []);


  useEffect(() => {
    if (socket) {
      
        socket.on('update_unread_count', ({ senderId }) => {
          if (senderId !== 123) {

            console.log("Received unread count update");
            setCountUnread((prevResponse) => ({
              ...prevResponse,
              [senderId]: (prevResponse[senderId] || 0) + 1,
            }));
          }
        });
      

    } else {
      console.log('Socket is not defined');
    }

    return () => {
      if (socket) {
        socket.off('update_unread_count');
        socket.off("connect")

      }
    };
  }, [socket]);


  return (
    <div className="container">
      <div className="row mt-4">
        {users.map((user) => (
          <div key={user._id} className="col-md-4 mt-4">
            {countUnread[user._id] > 0 && (
              <div
                style={{
                  position: 'relative',
                  borderRadius: '50%',
                  top: '1rem',
                  left: '18rem',
                  transform: 'translateX(-50%)',
                  zIndex: 1,
                  color: 'white',
                  width: '1.7rem',
                  height: '1.7rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'black',
                  lineHeight: '1.7rem',
                  textAlign: 'center',
                }}
              >
                {Number(countUnread[user._id])}
              </div>
            )}
            <div className="card" style={{ width: '18rem' }}>
              <div className="card-body">
                <h5 className="card-title">{user.name}</h5>
                <p className="card-text">{user.email}</p>

                <Link
                  to="/chat-box"
                  onClick={() => {
                    console.log('ok')
                    localStorage.setItem('receiver', JSON.stringify(user));

                  }}
                  className="btn btn-dark"
                >
                  Let's Chat
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default User;
