import React from "react";
import { Link } from "react-router-dom";
import { UseAuth } from "../store/auth";

const Navbar = () => {
  const { isLoggedIn, LogoutUser } = UseAuth();

  if (!isLoggedIn) return null;

  return (

    <div className="admin-layout">
      <div className="sidebar">
        <Link className="logo" to="/home">
          SuperAdmin
        </Link>
        <ul className="nav">
          {isLoggedIn ? (
            <>
              <li>
                <Link  to="/admins">
                  Admins
                </Link>
              </li>
              <li>
                <Link to="/tasktouser">Tasks</Link>
              </li>
              <li>
                <Link to="/reports">Reports</Link>
              </li>

              <div className="logout-container">
                <Link
                  to="/logout"
                  className="btn btn-danger text-white "
                  onClick={LogoutUser}
                >
                  LogOut
                </Link>
              </div>
              
            </>
          ) : (
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
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
