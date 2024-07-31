import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate, } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { UseAuth } from "../store/auth";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { storeTokenInLS,isLoadding } = UseAuth();

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleLogin = (event) => {
    event.preventDefault();
  
    // Validation checks
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("A valid email is required.");
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      return;
    }
  
    axios
    .post("http://localhost:3000/login", { email, password })
    .then((response) => {
      const { token, roles, formFields } = response.data;

      storeTokenInLS(token);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "You have been successfully logged in!",
      });

      // Navigate to '/task' (or any other route) with role and formFields data
      navigate("/task", { state: { roles, formFields } });
    })
    .catch((err) => {
      if (err.response) {
        // Error handling based on backend response
        if (err.response.status === 400 && err.response.data.message === "User must have at least one role") {
          toast.error("You do not have any roles assigned. Please contact support.");
        } else if (err.response.status === 401 && err.response.data.message === "Incorrect password") {
          toast.error(
          "Incorrect password. Please try again."
          );
        } else {
          toast.error(err.response.data.message || 'An unexpected error occurred');
        }
      } else {
        
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };
  return (
    <div className="container-fluid bimg">
       <ToastContainer />

       <div className="container">
      <div className="row pt-5">
        <div className="col-5">
          <img
            src="../../loginimage.jpg"
            className="loginimg"
           
            alt=""
          />
        </div>
        <div className="col-7 ">
          <div className="LoginSection">
            <h2>Welcome Back!</h2>
            <p>Please enter your log in detail below.</p>
            <form onSubmit={handleLogin}>
              <div className="mb-3 input-group">
                <input
                  type="email"
                  placeholder="Email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FontAwesomeIcon icon={faEnvelope} className="icons" />
              </div>
              <div className=" input-group">
                <input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FontAwesomeIcon
                  className="icons"
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={togglePasswordVisibility}
                />
              </div>
              <div class="forgotpass">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <Link to="/forgotpassword">Forgot Password ?</Link>
              </div>
              <button type="submit" className=" loginbtn ">
                Submit
              </button>
            </form>
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
            {/* <p>
              <Link to="/admin_login">Admin-Login</Link>
            </p> */}
          </div>
        </div>
      </div>
      </div>


    </div>
  );
};

export default Login;
