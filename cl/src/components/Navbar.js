import React,{useState} from "react";
import { Link } from "react-router-dom";
import { UseAuth } from "../store/auth";
import { Modal } from 'react-bootstrap';
import UserProfile from './UserProfile'; // Adjust the path as necessary
import './NavbarWithProfileModal.css';
import ProfilePopup from "./ProfilePopup";

const Navbar = () => {
  const { isLoggedIn, LogoutUser, user} = UseAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleTogglePopup = () => setIsPopupOpen(!isPopupOpen);


  return (
    <nav className="  navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid bg-dark">
        {isLoggedIn  && user ? (
          <h4 style={{ color: "white" }}>Welcome, {user.name}</h4>
        ) : null}
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav  w-100">
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/logout" onClick={LogoutUser}>
                    Logout
                  </Link>
                </li>
                <li>  <Link className="nav-link" to="/task" >
                    AssignedTask
                  </Link></li>
                  
                {user && user.isAdmin && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/users">
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                {user && user.profileImage ? (
                <img 
                  src={`http://localhost:3000${user.profileImage}`}
                  alt="Profile"
                  className="profile-logo"
                  onClick={handleTogglePopup}
                  style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%'}}
                />
              ) : (
                <div className="initials-circle" onClick={handleTogglePopup} style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', background: 'gray' }}>
                  {user ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              </li>
              </>
            )}
          </ul>
          <ProfilePopup isOpen={isPopupOpen} onClose={handleTogglePopup} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
