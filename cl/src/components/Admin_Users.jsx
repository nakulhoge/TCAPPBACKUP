
import React, { useEffect, useState } from "react";
import { UseAuth } from "../store/auth";

const Admin_Users = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false); // New state for toggling view

  const { authorizationToken } = UseAuth();

  const getAllUsersData = async () => {
    try {
      const response = await fetch("http://localhost:3000/admin/users", {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/users/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authorizationToken,
          },
        }
      );
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const archiveUser = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/users/archive/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: authorizationToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ archived: true }),
        }
      );
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id ? { ...user, archived: true } : user
          )
        );
      } else {
        console.error("Failed to archive user");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const unarchiveUser = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/users/archive/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: authorizationToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ archived: false }),
        }
      );
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id ? { ...user, archived: false } : user
          )
        );
      } else {
        console.error("Failed to unarchive user");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    getAllUsersData();
  }, []);

  // Filter users based on the view mode and search query
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (showArchived ? user.archived : !user.archived)
  ).reverse();

  return (
    <div>
      <div className="AdminUsersSection">
        <h3>Team Members Information</h3>
        <div className="AdminUsers">
          
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="search name"
          />
        </div>
        <div className="archivebtn">
        <button onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? "Show Unarchived" : "Show Archived"}
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Roles</th>
              <th>Position</th>
              <th>Joining Date</th>
              <th>Resource Date</th>
              <th>Skills</th>
              <th>Archive</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((curUser, index) => (
              <tr key={index}>
                <td>{curUser.name}</td>
                <td>{curUser.email}</td>
                <td>{curUser.mobile}</td>
                <td>
  {curUser.roles.map((role, index) => (
    <span key={role.id}>
      {role.role}
      {index < curUser.roles.length - 1 ? ', ' : ''}
    </span>
  ))}
</td>
                <td>{curUser.position}</td>
                <td style={{ textAlign: 'center' }}>
                  {curUser.joinDate ? new Date(curUser.joinDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                  }) : "-"}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {curUser.endDate ? new Date(curUser.endDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                  }) : "-"}
                </td>
                <td>{curUser.skillSet.join(', ')}</td>

               
                <td>
                  {curUser.archived ? (
                    <span
                      className="material-symbols-outlined"
                      onClick={() => unarchiveUser(curUser._id)}
                    >
                      unarchive
                    </span>
                  ) : (
                    <span
                      className="material-symbols-outlined"
                      onClick={() => archiveUser(curUser._id)}
                    >
                      archive
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className="material-symbols-outlined"
                    onClick={() => deleteUser(curUser._id)}
                  >
                    delete
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin_Users;
