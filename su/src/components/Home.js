import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const Home = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users');
        setUsers(response.data);
      } catch (error) {
        setError('Error fetching users.');
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:3000/roles');
        setRoles(response.data);
      } catch (error) {
        setError('Error fetching roles.');
      }
    };

    fetchUsers();
    fetchRoles();
  }, []);

  const roleOptions = roles.map(role => ({ value: role._id, label: role.role }));

  const handleRoleChange = async () => {
    if (selectedUserId) {
      const roleIds = selectedRoles.map(role => role.value);
      try {
        await axios.put(`http://localhost:3000/assign-roles/${selectedUserId}`, { roles: roleIds });
        setSelectedUserId(null);
        setSelectedRoles([]);
        // Refresh the user list
        const response = await axios.get('http://localhost:3000/users');
        setUsers(response.data);
      } catch (error) {
        setError('Error assigning roles.');
      }
    }
  };

  const openRoleEditor = (userId, currentRoles) => {
    setSelectedUserId(userId);
    setSelectedRoles(
      currentRoles.map(roleId => {
        const role = roles.find(r => r._id === roleId);
        return role ? { value: role._id, label: role.role } : null;
      }).filter(role => role !== null)
    );
  };

  return (
    <div className='marginForleft'>
      <h1>Team Members Information</h1>
      {error && <p className="error">{error}</p>}
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Admin Status</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.mobile}</td>
              <td>{user.isAdmin ? 'Admin' : 'Regular User'}</td>
              <td>
                {selectedUserId === user._id ? (
                  <Select
                    isMulti
                    options={roleOptions}
                    value={selectedRoles}
                    onChange={setSelectedRoles}
                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                  />
                ) : (
                  (user.roles || []).map(roleId => {
                    const role = roles.find(r => r._id === roleId);
                    return role ? role.role : 'No Role';
                  }).join(', ') || 'No Role'
                )}
              </td>
              <td>
                {selectedUserId === user._id ? (
                  <button onClick={handleRoleChange}>Save</button>
                ) : (
                  <button onClick={() => openRoleEditor(user._id, user.roles)}>Edit Roles</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
