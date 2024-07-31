import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faMobileAlt,
  faEye,
  faEyeSlash,
  faAnglesDown,
} from "@fortawesome/free-solid-svg-icons";
import { UseAuth } from "../store/auth";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegistrationForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [position, setPosition] = useState("");
  const [joinDate, setJoinDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [skillSet, setSkillSet] = useState([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { storeTokenInLS } = UseAuth();

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const skillsOptions = [
    { value: "Java", label: "Java" },
    { value: "Html", label: "HTML" },
    { value: "Css", label: "CSS" },
    { value: "JavaScript", label: "JavaScript" },
    { value: "React", label: "React" },
    { value: "Node", label: "Node" },
    { value: "Angular", label: "Angular" },
    { value: "Bootstrap", label: "Bootstrap" },
    { value: "Aws", label: "Aws" },
    { value: "Docker", label: "Docker" },
    { value: "Git", label: "Git" },
    { value: "C++", label: "C++" },
    { value: "C", label: "C" },
    { value: "Ruby", label: "Ruby" },
    { value: "Golang", label: "Golang" },
    { value: "SpringBoot", label: "SpringBoot" },
    { value: "Linux", label: "Linux" },
    { value: "Typescript", label: "Typescript" },
    { value: "Sql", label: "Sql" },
    { value: "MongoDb", label: "MongoDb" },
    { value: "Sap", label: "Sap" },
    { value: "Python", label: "Python" },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validation checks
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("A valid email is required.");
      return;
    }
    if (!mobile || !/^[6-9][0-9]{9}$/.test(mobile) || mobile.length !== 10) {
      toast.error("A valid mobile number is required (10 digits, starting with 6-9).");
      return;
    }
    if (!position) {
      toast.error("Position is required.");
      return;
    }
    if (!joinDate) {
      toast.error("Join date is required.");
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      return;
    }

    // Optionally, you can validate password strength
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    const skills = skillSet.map((option) => option.value);

    axios
      .post("http://localhost:3000/register", { name, email, mobile, position, joinDate, endDate, skills, password })
      .then((response) => {
        const token = response.data.token;
        storeTokenInLS(token);

        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "You have been successfully registered! Please log in.",
        });
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: "Email Already Exists",
        });
      });
  };

  const handleChangeSkills = (selectSkill) => {
    setSkillSet(selectSkill);
  };

  useEffect(() => {
    if (position === "Intern" && joinDate) {
      const newEndDate = new Date(joinDate);
      newEndDate.setMonth(newEndDate.getMonth() + 3);
      setEndDate(newEndDate);
    } else {
      setEndDate(null);
    }
  }, [position, joinDate]);

  return (
    <div className="container-fluid bimg">
      <ToastContainer />

      <div className="container">
      <div className="row"> 
        <div className="col-6">
          <img
            src="../../register.jpg"
            className="registerimg"
           
            alt="register_image"
          />
        </div>
        <div className="col-6">
          <div className="registerSection">
            <h2>Create an account</h2>
            <p>Please enter your details below</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  placeholder="Name"
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <FontAwesomeIcon icon={faUser} className="icons" />
              </div>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FontAwesomeIcon icon={faEnvelope} className="icons" />
              </div>
              <div className="input-group">
                <input
                  placeholder="Mobile"
                  type="text"
                  className="form-control"
                  maxLength="10"
                  pattern="[6-9][0-9]{9}"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
                <FontAwesomeIcon icon={faMobileAlt} className="icons" />
              </div>
              <div className="input-group">
                <select
                  value={position}
                  className="form-control"
                  onChange={(e) => setPosition(e.target.value)}
                  required
                >
                  <option value="">Select Position</option>
                  <option value="Intern">Intern</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                </select>
                <FontAwesomeIcon icon={faAnglesDown} className="icons" />
              </div>
              <div className="input-group">
                <DatePicker
                  selected={joinDate}
                  onChange={(date) => setJoinDate(date)}
                  placeholderText="Select Join Date"
                  className="date-picker form-control"
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <FontAwesomeIcon icon={faAnglesDown} className="icons" />
              </div>
              <div className="input-group">
                <Select
                  isMulti
                  name="skills"
                  placeholder="Select Skills"
                  value={skillSet}
                  className="form-control"
                  options={skillsOptions}
                  onChange={handleChangeSkills}
                  required
                />
              </div>
              <div className="input-group">
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
              <button type="submit" className="loginbtn">
                Register
              </button>
            </form>
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
      </div>


    </div>
  );
};

export default RegistrationForm;