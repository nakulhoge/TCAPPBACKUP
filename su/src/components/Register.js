import React, { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faEnvelope,
  faMobileAlt,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'
import { UseAuth } from '../store/auth'

const RegistrationForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { storeTokenInLS } = UseAuth()

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Form submitted:', { name, email, mobile, password })
    axios
      .post('http://localhost:3000/register', { name, email, mobile, password })
      .then((response) => {
        const token = response.data.token
        storeTokenInLS(token)

        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'You have been successfully registered! please login',
        })
        navigate('/login')
      })
      .catch((err) => {
        console.log(err)
        Swal.fire({
          icon: 'error',
          title: 'Registation failed',
          text: 'Email Already Exists',
        })
      })
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div class="col-6">
          <div className="LoginSection">
            <h2>Create an account</h2>
            <p>Please enter your detail below to create account.</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 input-group">
                <input
                  placeholder="Name"
                  type="text"
                  className="form-control"
                  id="email"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FontAwesomeIcon icon={faUser} className="icons" />
              </div>
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
              <div className="mb-3 input-group">
                <input
                  placeholder="Mobile"
                  type="text"
                  className="form-control"
                  pattern="[6-9][0-9]{9}"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
                <FontAwesomeIcon icon={faMobileAlt} className="icons" />
              </div>
              <div className=" input-group">
                <input
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
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
              <div class="forgotpass ">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
              </div>
              <button type="submit" className=" loginbtn ">
                Register
              </button>
            </form>
            <p>
              Already have an account ? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
        <div class="col-6">
          <img
            src="../../register.jpg"
            className="loginimg"
            height={525}
            alt="register_image"
          />
        </div>
      </div>
    </div>
  )
}

export default RegistrationForm
