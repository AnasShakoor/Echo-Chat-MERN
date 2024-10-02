import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar';
import EchoState from './context/EchoState';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/Signup';
import Alert from './components/Alert';
import User from './components/User';
import ChatBox from './components/ChatBox';

function App() {
  return (

    <EchoState>
      <Navbar/>
      <Alert/>
      <Routes>
      <Route exact path="/login" element={<Login/>} />
      <Route exact path="/users" element={<User/>} />
      <Route exact path="/chat-box" element={<ChatBox/>} />
      <Route exact path="/Sign-up" element={<SignUp/>} />
      </Routes>
    </EchoState>
  );
}

export default App;
