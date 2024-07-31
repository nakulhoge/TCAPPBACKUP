import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.API_URL

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    console.log("Form submitted:", { email, password });
    axios
      .post(`${API_URL}/admin_login`, { email, password })
      .then((result) => {
        console.log(result);
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "You have been successfully LogIn!",
        });
        navigate("/home");
      })
      .catch((err) => console.log(err));
    Swal.fire({
      icon: "error",
      title: "Login failed",
      text: "Incorrect email or password",
    });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div class="col-6">
          <div className="LoginSection">
            <h2>Welcome Admin!</h2>
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
              <button type="submit" className=" loginbtn ">
                Submit
              </button>
            </form>
          </div>
        </div>
        <div class="col-6">
          <img src="../../admin.jpg" className="loginimg" height={300} alt="" />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
