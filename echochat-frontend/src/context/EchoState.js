import React from "react";
import EchoContext from './EchoContext'
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
const SOCKET_SERVER_URL = 'http://localhost:3000';

const EchoState = (props) => {
    const navigate = useNavigate()


    const [alert, setAlert] = useState({ state: false, message: "no message" });

    const [socket, setSocket] = useState(null);

    const showAlert = (message) => {
        setAlert({ state: true, message: message })
        setTimeout(() => {
            setAlert({ state: false, message: "no message" })
        }, 2000);
    }





    const countUnreadMessages = async (user1, user2, receiverId) => {
        const sortedIDs = [user2, user1].sort();
        const roomId = sortedIDs.join('-');
        try {
            const response = await fetch(`http://localhost:3000/api/chat/unread-messages/${roomId}/${receiverId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token')
                    }
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData
            }

            const json = await response.json();
            return json;

        } catch (error) {
            throw error
        }
    };









    const chatHistory = async (roomId) => {
        try {
            const response = await fetch('http://localhost:3000/api/chat/history',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        roomId: roomId
                    }),
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData
            }

            const json = await response.json();
            return json;

        } catch (error) {

            throw error
        }
    };


    const markAsRead = async (receiver, roomId) => {
        try {
            const response = await fetch('http://localhost:3000/api/chat/mark-read',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        roomId: roomId,
                        receiver: receiver
                    }),
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData
            }

            const json = await response.json();
            return json;

        } catch (error) {

            throw error
        }
    };


    const getFirstUnreadMessage = async (roomId) => {
        try {
            const response = await fetch('http://localhost:3000/api/chat/get-first-unread',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        roomId: roomId
                    }),
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData
            }

            const json = await response.json();
            return json;

        } catch (error) {

            throw error
        }
    };


    const newMessage = async ({senderId, receiverId, roomId, message,file}) => {
        const formData = new FormData();
        formData.append('sender', senderId);
        formData.append('receiver', receiverId);
        formData.append('roomId', roomId);
        if (message) {
            formData.append('message', message);
        }
        if (file) {
            formData.append('file', file);
        }

        // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }
        try {
            const response = await fetch('http://localhost:3000/api/chat',
                {
                    method: 'POST',
                    headers: {
                        'auth-token': localStorage.getItem('token'),
                        // 'content-type': "multipart/form-data"
                    },
                    body: formData,
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData
            }

            const json = await response.json();
            return json

        } catch (error) {

            console.log(error)
            throw error
        }
    };

    const SignUp = async (name, email, password) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/sign-up',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                    }),
                });

            if (!response.ok) {
                // Try to get error details from response
                const errorData = await response.json(); // This will contain the error message sent from the server
                throw errorData
            }

            const json = await response.json();
            return json

        } catch (error) {

            throw error
        }
    };

    const Login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                });

            if (!response.ok) {
                // Try to get error details from response
                const errorData = await response.json(); // This will contain the error message sent from the server

                throw errorData
            }

            const json = await response.json();
            return json

        } catch (error) {

            throw error
        }
    };

    // fetch users 
    const getUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/fetch-users',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData
            }

            const json = await response.json();

            return json.users

        } catch (error) {

            throw error
        }
    };

    // const as=()=>{

    //       setSocket(newSocket);
    // }



    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login")
        }
        const sockets = io(SOCKET_SERVER_URL, {
            transports: ['websocket'],
        });
        setSocket(sockets);

        return (() => {
            sockets.disconnect();
        })

    }, [])



    return (
        <EchoContext.Provider value={{ alert, socket, Login, SignUp, showAlert, getUsers, newMessage, chatHistory, markAsRead, getFirstUnreadMessage, countUnreadMessages, setSocket }}>
            {props.children}
        </EchoContext.Provider>
    )
}

export default EchoState;