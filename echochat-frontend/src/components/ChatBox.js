
import React, { useState, useEffect, useContext, useRef } from 'react';
import '../index.css'; // Importing a CSS file
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import EchoContext from '../context/EchoContext';

const SOCKET_SERVER_URL = 'http://localhost:3000';

function ChatBox() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ message: '' });
    const [messages, setMessages] = useState([]);
    const [receiver, setreceiver] = useState({});
    const [sender, setSender] = useState({});
    const [socket, setSocket] = useState(null);
    const [roomID, setRoomID] = useState('');
    const messagesEndRef = useRef(null);
    const echo = useContext(EchoContext);
    const { roomId: contextRoomId, newMessage, chatHistory, markAsRead, getFirstUnreadMessage } = echo;
    const [loading, setLoading] = useState(true);

    const updateForm = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async (e) => {
        e.preventDefault();
        if (form.message.trim() === '') return;

        const value = {
            message: form.message,
            sender: sender._id,
            receiver: receiver._id,
            read: false
        }
        setMessages(prevMessages => [...prevMessages, value]);
        socket.emit('send_message', { msg: form.message, roomId: roomID, senderId: sender._id, receiverId: receiver._id });
        setForm({ message: '' });
        await newMessage(sender._id, receiver._id, roomID, form.message);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            submit(e);
        }
    };

    const fetchChatHistory = async (generatedRoomID) => {
        try {
            const response = await chatHistory(generatedRoomID);
            return response;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }
    };

    useEffect(() => {


        const loggedInUser = JSON.parse(localStorage.getItem("logged_in_user"));
        const receiverUser = JSON.parse(localStorage.getItem("receiver"));

        if (!loggedInUser || !receiverUser) {
            console.error("One or both users not found in localStorage.");
            navigate('/login');
            return;
        }

        setSender(loggedInUser);
        setreceiver(receiverUser);

        const sortedIDs = [receiverUser._id, loggedInUser._id].sort();
        const generatedRoomID = sortedIDs.join('-');
        setRoomID(generatedRoomID);

        const getChatHistory = async () => {
            try {
                const response = await fetchChatHistory(generatedRoomID);
                if (response) {
                    console.log(response.history)
                    setMessages(response.history);
                }

            } catch (error) {
                console.error("Error fetching chat history:", error);
            } finally {
                setLoading(false);

            }
        };

        getChatHistory();

        const newSocket = io(SOCKET_SERVER_URL, {
            transports: ['websocket'],
        });
        setSocket(newSocket);

        newSocket.emit('joinRoom', { roomId: generatedRoomID, userId: loggedInUser._id });

        newSocket.on('receive_message', ({ msg, sender, receiverId }) => {
            const value = {
                message: msg,
                sender: sender,
            }

            setMessages(prevMessages => [...prevMessages, value]);
            console.log("Ok So I have received the message");
            const updateRead = async () => {
                const response = await markAsRead(receiverId, generatedRoomID);
                console.log(response);
            }
            updateRead();
            newSocket.emit('Update read status', generatedRoomID);

        })

        newSocket.on("Update read status 2", () => {
            setMessages(prevMessages => {
                
                return prevMessages.map(message => ({
                    ...message,
                    read: message.read === false ? true : message.read // Update read status here
                }));
            });
        })

        const updateRead = async () => {
            try {
                const response = await getFirstUnreadMessage(generatedRoomID);
                const receiverId = response.data.receiver;
                if (loggedInUser._id == receiverId) {
                    newSocket.emit('Update read status', generatedRoomID);
                    await markAsRead(receiverId, generatedRoomID);

                }
            } catch (error) {
                console.log(error)
            }

        }

        updateRead();
        return () => {
            newSocket.disconnect();
        };

    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }

    }, [messages]);

    const getBackgroundColor = (message) => {
        if (message.read && message.sender === sender._id) {
            return 'rgb(134, 170, 237)';
        } else if (!message.read && message.sender === sender._id) {
            return 'rgb(224, 224, 224)';
        } else {
            return 'rgb(121, 190, 242)';
        }
    };






   
    return (

        <div>
            <div className="card" style={{ width: '80%', height: '88vh', margin: '0.5rem auto' }}>
                <div className="card" style={{ width: '100%', height: '9vh' }}>
                    <div className="card-body">
                        <h3 style={{ fontSize: "1rem" }} className="card-title">{receiver.name}</h3>
                    </div>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', maxHeight: '100%' }}>

                    {loading &&
                    <span className="loader "></span> 
                    }
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {messages.map((message, index) => (
                            <li
                                key={index}
                                // dangerouslySetInnerHTML={{ __html: message.message }}
                                style={{
                                    textAlign: message.sender === sender._id ? 'left' : 'left',
                                    margin: '5px 0',
                                    padding: '10px',
                                    backgroundColor: getBackgroundColor(message),
                                    borderRadius: '10px',
                                    maxWidth: '47%',
                                    whiteSpace: "pre-wrap",
                                    marginLeft: message.sender === sender._id ? 'auto' : '0',
                                }}
                            >
                                {message.message}
                            </li>
                        ))}
                        <div ref={messagesEndRef} ></div>
                    </ul>

                    <div ref={messagesEndRef}></div>
                </div>
                <form onSubmit={submit}>
                    <div className="input-group">
                        <textarea
                            className="form-control mx-2"
                            placeholder="Enter text"
                            aria-label="Enter text"
                            onChange={updateForm}
                            style={{ border: '2px solid black' }}
                            value={form.message}
                            onKeyDown={handleKeyDown}
                            name="message"
                            id="message"
                            rows="1"
                            cols="30"
                        />
                        <i
                            style={{ fontSize: '25px', cursor: 'pointer' }}
                            onClick={submit}
                            className="fa-regular fa-paper-plane mt-2 mx-2"
                        ></i>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChatBox;
