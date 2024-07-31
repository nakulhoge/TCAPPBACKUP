import React, { useState } from 'react';

const ProfileUserShowHide = ({ selectedUsersData }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  const handleNextUser = () => {
    setCurrentUserIndex((prevIndex) => (prevIndex + 1) % selectedUsersData.length);
  };



  const user = selectedUsersData[currentUserIndex];

  return (
    <div className="col-4 offset-2 p-2 shadow border rounded h-50 bg-light" style={{ position: 'relative' }}>
      <h3 style={{ fontFamily: 'Poppins' }}>User Profiles</h3>

      {user && (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Mobile:</strong> {user.mobile}</p>
          <p><strong>Join Date:</strong> {user.joinDate ? new Date(user.joinDate).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          }) : ''}</p>
          <p><strong>End Date:</strong> {user.endDate ? new Date(user.endDate).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          }) : ''}</p>
          <p><strong>Position:</strong> {user.position}</p>
          <p><strong>Skill Set:</strong> {user.skillSet && Array.isArray(user.skillSet) ? user.skillSet.join(', ') : ''}</p>
          {user.profileImage && (
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
              <img
                src={`http://localhost:3000${user.profileImage}`}
                alt="Profile"
                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
              />
            </div>
          )}
        </div>
      )}

      <button onClick={handleNextUser} className=" btn btn-success mx-2" style={{width:'40%'}}>Next Profile</button>

    
    </div>
  );
};

export default ProfileUserShowHide;
