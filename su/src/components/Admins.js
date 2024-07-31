import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedForPromotion, setSelectedForPromotion] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admins');
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:3000/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/usersforadmin?name=${searchName}`);
      if (Array.isArray(response.data)) {
        setSearchResults(response.data);
        console.log(searchResults)
      } else {
        setSearchResults([]); // Fallback to empty array if response is not an array
      }
    } catch (error) {
      console.error('Error searching for user: ', error);
      setSearchResults([]); // Fallback to empty array on error
    }
  };
  // Log searchResults whenever it changes
  useEffect(() => {
    console.log('Updated searchResults:', searchResults);
  }, [searchResults]);

  const promoteToAdmin = async (userId) => {
    try {
      setLoading(true)
      await axios.put(`http://localhost:3000/admins/${userId}`);
      const user = searchResults.find((user) => user._id === userId);
      if (user) {
        await fetchAdmins();
        setSearchResults([]);
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error('Error promoting user to admin: ', error);
    }
  };

  const removeAdmin = async (userId) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:3000/remove-admin/${userId}`);
      setAdmins(admins.filter(admin => admin._id !== userId));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error removing admin:', error);
    }
  };


  const handleAddRole = async () => {
    try {
      await axios.post('http://localhost:3000/roles', { role: newRole });
      setNewRole('');
      const response = await axios.get('http://localhost:3000/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error adding role: ', error);
    }
  };


  return (
    <div className=" marginForleft">
      <h1>Create Admins</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <button className="btn btn-primary ms-2" onClick={handleSearch}>Search</button>
      </div>
      {searchResults.length > 0 && (
        <div>
          <h2>Search Results</h2>
          <ul className="list-group">
            {searchResults.map((user) => (
              <li key={user._id} className="list-group-item d-flex justify-content-between align-items-center">
                {user.name} - {user.email}
                <button className="btn btn-success" onClick={() => promoteToAdmin(user._id)}>Promote to Admin</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <ul className="list-group">
          {admins.map((admin) => (
            <li key={admin._id} className="list-group-item d-flex justify-content-between align-items-center">
              {admin.name} - {admin.email}
              <button className="btn btn-danger" onClick={() => removeAdmin(admin._id)}>Remove Admin</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Add New Role</h2>
        <input
          type="text"
          className="form-control"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
        <button className="btn btn-primary mt-2 mx-5" onClick={handleAddRole}>Add Role</button>
      </div>
    </div>
  );
};

export default Admins;
