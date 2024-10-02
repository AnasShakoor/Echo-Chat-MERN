import {React , useEffect} from 'react'
import { Link ,useLocation,useNavigate} from 'react-router-dom';



function Navbar() {
  const location = useLocation();
  const navigate = useNavigate() 

 const logout = (e)=>{
  e.preventDefault();
  localStorage.clear()
  navigate("/login")
 }
 
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
  <div className="container-fluid">
    <Link className="navbar-brand" to="/">EchoChat</Link>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link className="nav-link active" aria-current="page" to="/users">Users</Link>
        </li>
         
      </ul>

      {!localStorage.getItem('token') ?
        <form className="d-flex" >
      <Link className="btn btn-primary mx-2" to="/login" role="button">Login</Link>
      <Link className="btn btn-primary mx-2" to="/sign-up" role="button">Sign Up</Link>
      </form>
      :<button onClick={logout}  className="btn mx-2">Log out </button>  
      }
    </div>
  </div>
</nav>
    </div>
  )
}

export default Navbar
