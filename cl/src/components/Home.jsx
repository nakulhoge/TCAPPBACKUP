import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";


const Home = () => {
  const location = useLocation();
  const { state } = location;
  const storedRole = localStorage.getItem("role");
  const storedFormFields = JSON.parse(localStorage.getItem("formFields"));
  const [role, setRole] = useState(storedRole || (state ? state.role : null));
  const [formFields, setFormFields] = useState(
    storedFormFields || (state ? state.formFields : [])
  );
  const [formData, setFormData] = useState({});
  // const [task, setTask] = useState([]);
  const [img, setImg] = useState(null); // State for the image
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    if (state) {
      localStorage.setItem("role", state.role);
      localStorage.setItem("formFields", JSON.stringify(state.formFields));
      setRole(state.role);
      setFormFields(state.formFields);
    }
  }, [state]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImg(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataWithImage = new FormData();
      formDataWithImage.append("role", role);
      formDataWithImage.append("latitude", latitude);
      formDataWithImage.append("longitude", longitude);
      Object.entries(formData).forEach(([key, value]) => {
        formDataWithImage.append(key, value);
      });
      if (img) {
        formDataWithImage.append("photo", img); // Append the image to FormData
      }
      // Send form data to the backend
      await axios.post("http://localhost:3000/submit-form", formDataWithImage, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    }
  };

  
    // Get unique groups from form fields
    const groups = [...new Set(formFields.map(field => field.group))];

  return (
    <div className="container-fluid ">
      <Navbar />
      <div className="row">
        <div className="col-6">
          <img
            style={{ width: "80%", height: "60%" }}
            src="../../home.png"
            className="homeimg"
            alt="register_image"
          />
        </div>
        <div className=" col-6 ">
          <div className="HomeSection">
            <h2>{role}</h2>

            {groups.map(group => (
            <div key={group}>
              <h3>{group}</h3>
            <form >
            {formFields.filter(field => field.group === group).map(field => (
                <div key={field._id}>
                  <label htmlFor={field.fieldName}>{/*{field.label}*/}</label>
                  {field.type === "select" ? (
                    <select
                      id={field.fieldName}
                      onChange={handleInputChange}
                      required={field.required}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {field.label}
                      </option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "file" ? (
                    <input
                      className="custom-file-label"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  ) : (
                    <input
                      type={field.type}
                      id={field.fieldName}
                      placeholder={field.label}
                      required={field.required}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              ))}
               </form>
            </div>
          ))}
          <button type="submit" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
