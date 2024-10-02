import { React, useState, useContext } from 'react'
import  EchoContext from "../context/EchoContext";
import { useNavigate } from 'react-router-dom';
function Login() {
    const [form, setForm] = useState({ email: "", password: "" })
    const echo = useContext(EchoContext)
    const { Login,showAlert } = echo;
    const [errors, setErrors] = useState({})
    const navigate = useNavigate();
    const updateForm = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const submit = async (e) => {
        e.preventDefault();

        try {

            let response = await Login(form.email, form.password);
            setForm({ email: "", password: "" })
            navigate("/users");
            setErrors({});
            localStorage.setItem('token', response.token);
            
            localStorage.setItem('logged_in_user', JSON.stringify(response.user) )
            showAlert("The user logged in  successfully")

        } catch (error) {        
                if (error instanceof Array) {
                    const fieldErrors = {};
                    error.forEach((err) => {
                      fieldErrors[err.path] = err.msg; // Assume `err.path` contains the field name
                    });
                    setErrors(fieldErrors); // Set validation errors
                  } else {
                    showAlert(error.error || "An error occurred");
                  }
           
            }
    }

    return (
        <>
            <div className="container">
                <div className="card" style={{ left: "25rem", width: "25rem", position: "absolute", top: "5rem" }}>

                    <div className="card-body">
                        <h3 className="card-title text-center" style={{ color: "green" }}>Login</h3>

                        <form >

                            <div className="mb-3">


                                <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                                <input type="email" value={form.email} onChange={updateForm} className={`form-control ${errors.email ? 'is-invalid' : ''}`} name='email' id="exampleInputEmail1" aria-describedby="emailHelp" />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                                <input type="password" value={form.password} onChange={updateForm} className={`form-control ${errors.password ? 'is-invalid' : ''}`} name='password' id="exampleInputPassword1" />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>
                            <div className='d-flex justify-content-center'>
                                <button type="submit" onClick={submit} className="btn btn-primary ">Submit</button>
                            </div>
                        </form>


                    </div>
                </div>

            </div>
        </>
    )
}

export default Login
