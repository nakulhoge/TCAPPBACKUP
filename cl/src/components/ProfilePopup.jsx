import React from "react";
import UserProfile from "./UserProfile";
import "./NavbarWithProfileModal.css";
import Timer from "./Timer";

export default function ProfilePopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="profile-popup">
      <div className="profile-popup-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <UserProfile />
       
      </div>
    </div>
  );
}
