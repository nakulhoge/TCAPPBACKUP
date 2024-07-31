import React, { useState, useEffect } from "react";
import axios from "axios";

const Admin_RoleFormData = () => {
  const [formData, setFormData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
 
  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/admin/rolesFormData");
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };
  const openInMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };


  return (
    <div className="AdminRoleFormSection">
      <h3>RoleFormData</h3>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Submitted At</th>
            <th>Form Data</th>
            <th>Map</th>
            <th>Uploaded Image</th>
          </tr>
        </thead>
        <tbody>
          {formData.map((data, index) => (
            <tr key={index}>
              <td>{data.role}</td>
              <td>{new Date(data.submitedAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
      })}</td>
              <td>
                <pre>{JSON.stringify(data.formData, null, 2)}</pre>
              </td>
              <td>{data.formData.latitude && data.formData.longitude && (
          <button onClick={() => openInMap(data.formData.latitude, data.formData.longitude)} style={{backgroundColor:'skyblue',width:'100%'}}>
            location
          </button>
        )}</td>
              <td>  {data.formData.photo && (
                  <img
                    height={70}
                    src={`http://localhost:3000/${data.formData.photo}`}
                    alt="Submitted Image"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleImageClick(`http://localhost:3000/${data.formData.photo}`)}
                  />
                )}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedImage && (
        <div className="modalContainer">
          <div className="modalContent">
            <img
              src={selectedImage}
              alt="Selected Image"
              style={{ maxWidth: "100%", maxHeight: "100%", display: "block", margin: "auto" }}
            />
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin_RoleFormData;