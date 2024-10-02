import { React, useState, useContext } from 'react'
import noteContext from '../context/EchoContext';
import { useNavigate } from 'react-router-dom';

function SignUp() {

const [form, setForm] = useState({ name: "", email: "", password: "" })
const note = useContext(noteContext);
const [errors, setErrors] = useState({})
const navigate = useNavigate(); // Get the navigate function

const { SignUp, showAlert } = note;
const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
}

const submit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission

    try {

        await SignUp(form.name, form.email, form.password);
        setForm({ name: "", email: "", password: "" })
        showAlert("The User has been created successfully. Please login")
        navigate("/login")

        setErrors({});
    } catch (error) {
        
        
        
        if (error instanceof Array) {
            const fieldErrors = {};
            error.forEach((err) => {
              fieldErrors[err.path] = err.msg; // Assume `err.path` contains the field name
            });
            setErrors(fieldErrors); // Set validation errors
          } else {
            showAlert(error.message || "An error occurred");
          }
    }
}

return (
    <>
        <div className="container">
            <div className="card" style={{ left: "25rem", width: "30rem", position: "absolute", top: "5rem" }}>

                <div className="card-body">
                    <h3 className="card-title text-center" style={{ color: "green" }}>Sign Up</h3>

                    <form >
                        <div className="mb-3">


                            <label form="name" className="form-label">User Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={updateForm}
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                id="name"
                                name="name"
                                aria-describedby="emailHelp"
                            />
                            {/* Show validation error for email */}
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
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

export default SignUp
