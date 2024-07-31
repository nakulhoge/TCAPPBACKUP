import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { UseAuth } from "../store/auth";
import axios from "axios";
import "./UserProfile.css";

export default function UserProfile() {
  const [profileImage, setProfileImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    position: "",
    joinDate: "",
    skillSet: "",
  });
  const { user } = UseAuth();

  useEffect(() => {
    if (user && user.profileImage) {
      setProfileImage(`http://localhost:3000${user.profileImage}`);
    }
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        position: user.position,
        joinDate: user.joinDate,
        skillSet: user.skillSet ? user.skillSet.join(", ") : "",
      });
    }
  }, [user]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profileImage", file);

      try {
        const response = await axios.put(
          `http://localhost:3000/uploadProfile/${user._id}/profileImage`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setImageUrl(response.data.imageUrl);
        setProfileImage(URL.createObjectURL(file));
      } catch (error) {
        console.error("Error uploading the image:", error);
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset form data to current user details
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      position: user.position,
      joinDate: user.joinDate,
      skillSet: user.skillSet ? user.skillSet.join(", ") : "",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveClick = async () => {
    try {
      await axios.put(
        `http://localhost:3000/updateProfile/${user._id}`,
        formData
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const getInitials = (user) => {
    if (!user || typeof user.name !== "string" || user.name.trim() === "") {
      return ""; // Handle cases where user or user.name is undefined, not a string, or empty
    }

    const names = user.name.split(" ");

    if (names.length === 1) {
      // Handle case where there is only a first name
      return names[0].charAt(0);
    } else if (names.length > 1) {
      // Handle case where there are both first and last names
      const initials = names[0].charAt(0) + names[names.length - 1].charAt(0);
      return initials;
    } else {
      // Handle edge case where names array is empty or unexpected input
      return "";
    }
  };

  return (
    <div className="container">
      <div className="profile">
        <div className="profile-img-adj">
          <div className="profile-img">
            {profileImage ? (
              <img
                className="circle-img"
                src={imageUrl || profileImage}
                alt="Profile"
              />
            ) : (
              <div className="initials-circle">{getInitials(user)}</div>
            )}
          </div>
          <label htmlFor="upload-button" className="btn1">
            <FontAwesomeIcon icon={faPencilAlt} />
          </label>
        </div>
        <div className="profile-info">
          {isEditing ? (
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile"
              />
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Position"
              />
              <input
                type="text"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                placeholder="Join Date"
              />
              <input
                type="text"
                name="skillSet"
                value={formData.skillSet}
                onChange={handleChange}
                placeholder="Skill Set"
              />
              <button  onClick={handleSaveClick}>
                <FontAwesomeIcon icon={faSave} /> Save
              </button>
              <button  onClick={handleCancelClick}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          ) : (
            <div>
              <h2>{user.name}</h2>
              <h5>{user.email}</h5>
              <h5>{user.mobile}</h5>
              <h5>
                {user.roles.map((role, index) => (
                  <span key={role.id}>
                    {role.role}
                    {index < user.roles.length - 1 ? ", " : ""}
                  </span>
                ))}
              </h5>
              <h5>{user.position}</h5>
              <h5>
                {user.joinDate
                  ? new Date(user.joinDate).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })
                  : ""}
              </h5>
              <h5>
                {user.skillSet && Array.isArray(user.skillSet)
                  ? user.skillSet.join(", ")
                  : ""}
              </h5>
              <button onClick={handleEditClick} className="btn btn-primary" style={{'margin-left':'10px'}}>
                <FontAwesomeIcon icon={faPencilAlt} /> Edit
              </button>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
          id="upload-button"
        />
      </div>
    </div>
  );
}
