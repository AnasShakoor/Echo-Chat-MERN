
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect, useContext, useRef } from 'react';
import '../index.css'; // Importing a CSS file
import { useNavigate } from 'react-router-dom';
// import io from 'socket.io-client';
import EchoContext from '../context/EchoContext';
import { Loader } from 'rsuite';
// const SOCKET_SERVER_URL = 'http://localhost:3000';

function ChatBox() {
    const upload = useRef(null)
    const navigate = useNavigate();
    const [form, setForm] = useState({ message: '' });
    const [messages, setMessages] = useState([]);
    const [receiver, setreceiver] = useState({});
    const [sender, setSender] = useState({});
    const [roomID, setRoomID] = useState('');
    const [fileIcon, setFileIcon] = useState(false)
    const [fileLoader, setFileLoader] = useState(false)
    const [fileValue, setFileValue] = useState(null)
    const [file, setFile] = useState(null)
    const messagesEndRef = useRef(null);
    const echo = useContext(EchoContext);
    const { roomId: contextRoomId, newMessage, chatHistory, markAsRead, getFirstUnreadMessage, socket } = echo;
    const [loading, setLoading] = useState(true);

    const updateForm = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const uploadClick = () => {
        upload.current.click();
    }

    const handleFileChange = (e) => {
        let file = e.target.files[0]
        if (file) {
            console.log("file selected:" + file.name)
            setFile(file)
            setFileValue(file.name)
            setFileIcon(true)

        } else {
            console.log("Error")
        }
    }
    const submit = async (e) => {
        e.preventDefault();
        if (form.message.trim() === '' && fileIcon == false) return;

        if (fileIcon) {
           setFileLoader(true);            if (socket) {


                const response = await newMessage({ senderId: sender._id, receiverId: receiver._id, roomId: roomID, file });
                const fileUrl = response.chat.fileUrl;
                console.log(response)
                const value = {
                    fileUrl: fileUrl,
                    sender: sender._id,
                    receiver: receiver._id,
                    read: false
                }
                setMessages(prevMessages => [...prevMessages, value]);
                socket.emit('send_message', { msg: form.message, roomId: roomID, senderId: sender._id, receiverId: receiver._id, fileUrl });
                setForm({ message: '' });
                setFileLoader(false);
                setFileIcon(false);
            } else {
                console.error('Socket is not initialized');
            }


        }
        else {


            const value = {
                message: form.message,
                sender: sender._id,
                receiver: receiver._id,
                read: false
            }

            if (socket) {
                setMessages(prevMessages => [...prevMessages, value]);
                socket.emit('send_message', { msg: form.message, roomId: roomID, senderId: sender._id, receiverId: receiver._id });
                setForm({ message: '' });
                await newMessage({ senderId: sender._id, receiverId: receiver._id, roomId: roomID,message:form.message });
            } else {
                console.error('Socket is not initialized');
            }
        }

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


        if (socket == "initial value") {
            console.error("Socket is not initialized");
            return;
        } else {
            console.log("working properly")
        }


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
                } else {
                    console.log("no reponse")
                }

            } catch (error) {
                console.error("Error fetching chat history:", error);
            } finally {
                setLoading(false);

            }
        };


        getChatHistory();
        if (socket) {

            socket.emit('joinRoom', { roomId: generatedRoomID, userId: loggedInUser._id });

            socket.on('receive_message', ({ msg, sender, receiverId,fileUrl }) => {
                const value = {
                    message: msg,
                    sender: sender,
                    fileUrl:fileUrl
                }
                console.log("Ok So I have received the message");
                if (sender !== receiverId) {
                    setMessages(prevMessages => [...prevMessages, value]);
                }
                const updateRead = async () => {
                    const response = await markAsRead(receiverId, generatedRoomID);
                    console.log(response);
                }
                updateRead();
                socket.emit('Update read status', { roomId: generatedRoomID, sender, receiverId });

            })

            socket.on("Update read status 2", () => {
                setMessages(prevMessages => {
                    return prevMessages.map(message => ({
                        ...message,
                        read: message.read === false ? true : message.read
                    }));
                });
            })

            const updateRead = async () => {
                try {
                    const response = await getFirstUnreadMessage(generatedRoomID);
                    console.log(generatedRoomID);
                    const receiverId = response.data.receiver;
                    const senderId = response.data.sender;
                    if (loggedInUser._id == receiverId) {
                        socket.emit('Update read status', { roomId: generatedRoomID, sender: senderId, receiverId });
                        await markAsRead(receiverId, generatedRoomID);

                    }
                } catch (error) {
                    console.log(error)
                }
            }
            updateRead();
        }

        return (() => {
            if (socket) {
                socket.off("receive_message");
                socket.off("Update read status 2");
            }
        })

    }, [socket]);

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
                    {loading && <span className="loader"></span>}
                    {fileLoader && <span className='file-loader' ></span> }

                  {!fileLoader &&  <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {messages.map((message, index) => (
                            <li
                                key={index}
                                style={{
                                    textAlign: message.sender === sender._id ? 'left' : 'left',  // Adjust if necessary
                                    margin: '5px 0',
                                    padding: '10px',
                                    backgroundColor: getBackgroundColor(message),
                                    borderRadius: '10px',
                                    maxWidth: '47%',
                                    whiteSpace: "pre-wrap",
                                    marginLeft: message.sender === sender._id ? 'auto' : '0',
                                }}

                            >
                                                                {message.fileUrl && (
                                    <div>
                                        <img src={message.fileUrl} alt="Uploaded file" style={{ maxWidth: '100%', marginTop: '10px' }} />
                                    </div>
                                )}
                                {/* Display the message text if it exists */}
                                {message.message && (
                                    <div>
                                        {message.message}
                                    </div>
                                )}

                                {/* Display the file if there is a file URL */}
                                
                            </li>
                        ))}

                    </ul>}

                    <div ref={messagesEndRef}></div>
                </div>
                <form onSubmit={submit}>
                    <div className="input-group">
                        <input type="file" ref={upload} onChange={handleFileChange}
                            style={{ display: "none" }} />
                        <i
                            style={{ fontSize: '1.8rem', marginLeft: "8px", cursor: 'pointer' }}
                            className="fa-solid fa-paperclip "
                            onClick={uploadClick}
                        ></i>

                        {/* <div> */}
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
                        {fileIcon && (
                            <div>
                                <div
                                    style={{
                                        border: '1px solid #ccc',
                                        backgroundColor: '#f8f9fa',
                                        padding: '5px',
                                        position: 'relative',
                                        marginBottom: '5px',
                                        borderRadius: '5px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    <i className="fa fa-file" style={{ margin: '4px', position: 'relative' }}>
                                        {/* Close button */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '-1.2rem',
                                                right: '-0.99rem',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {
                                                setFileIcon(false)
                                            }}
                                        >
                                            &times;
                                        </div>
                                        {/* Text content */}
                                        <span style={{ fontSize: '0.6rem', verticalAlign: 'middle' }}>
                                            {fileValue}
                                        </span>
                                    </i>
        
                                </div>
                            </div>
                        )}


                     

                        <i
                            style={{ fontSize: '25px', cursor: 'pointer' }}
                            onClick={submit}
                            className="fa-regular fa-paper-plane mt-2 mx-2"
                            ></i>
                            {/* <span className='file-loader' ></span> */}
                    </div>
                </form>
            </div>
            
        </div>
    );
}

export default ChatBox;
