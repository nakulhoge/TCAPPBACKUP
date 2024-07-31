

// export default Admin_Layout;
import React from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { UseAuth } from "../store/auth";

const Admin_Layout = () => {
  const { user, isLoadding } = UseAuth();

  if (isLoadding) {
    return <h6 className="text-center mt-5">Loading...</h6>;
  }
  if (!user.isAdmin) {
    return <Navigate to="/logout" />;
  }
  return (
    <div className="admin-layout">
      <div className="sidebar">
        <NavLink to="/task">
          <h3 className="logo">Admin Panel</h3>
        </NavLink>

        <ul className="nav">
          <li>
            <NavLink to="/admin/users">Team Members</NavLink>
          </li>
          {/* <li>
            <NavLink to="/admin/roleFormData">RolesFormData</NavLink>
          </li> */}
          <li>
            <NavLink to="/admin/taskToTeamMembers">Assign Task To Team Members</NavLink>
          </li>
          <li>
            <NavLink to="/admin/reports">Reports</NavLink>
          </li>
        </ul>
        <div className="logout-container">
          <NavLink to="/logout" className="btn btn-danger text-white ">
            LogOut
          </NavLink>
        </div>
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Admin_Layout;
