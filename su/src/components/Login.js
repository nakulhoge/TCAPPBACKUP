import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'
import { UseAuth } from '../store/auth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { storeTokenInLS } = UseAuth()

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword)
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      console.log('Token found in local storage:', storedToken)
    } else {
      console.log('No token found in local storage')
    }
  }, [])

  const handleLogin = (event) => {
    event.preventDefault()
    console.log('Form submitted:', { email, password })
    axios
      .post('http://localhost:3000/superadmin', { email, password })
      .then((response) => {
        console.log(response)
        const token = response.data.token
        console.log(token)
        storeTokenInLS(token)
        console.log('storeTokenInLS value:', storeTokenInLS)

        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You have been successfully LogIn!',
        })
        navigate('/home')
      })
      .catch((err) => {
        console.log(err)
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: 'Incorrect email or password',
        })
      })
  }

  return (
    <div className="container-fluid backimg">
      <div className="row">
      
        <div class="col-md-6">
          <img
            src="../../loginimage.jpg"
            className="loginimg"
            height={440}
            alt=""
          />
        </div>
        <div class="col-md-6 ">
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
              <div class="forgotpass">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <Link to="/forgot_password">Forgot Password ?</Link>
              </div>
              <button type="submit" className=" loginbtn ">
                Submit
              </button>
            </form>
            {/* <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
