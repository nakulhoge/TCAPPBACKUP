import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const RoleAllocation = () => {
  const [roles, setRoles] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedFormField, setSelectedFormField] = useState('');
  const [roleAllocations, setRoleAllocations] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchFormFields();
    fetchRoleAllocations();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:3000/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchFormFields = async () => {
    try {
      const response = await axios.get('http://localhost:3000/formfields');
      setFormFields(response.data);
    } catch (error) {
      console.error('Error fetching form fields:', error);
    }
  };

  const fetchRoleAllocations = async () => {
    try {
      const response = await axios.get('http://localhost:3000/roleallocations');
      setRoleAllocations(response.data);
    } catch (error) {
      console.error('Error fetching role allocations:', error);
    }
  };

  const handleRoleAllocation = async () => {
    try {
      if (selectedRole && selectedFormField) {
        await axios.post('http://localhost:3000/assignformfields', {
          roleId: selectedRole,
          formField: selectedFormField,
        });
        fetchRoleAllocations();
        setSuccessMessage('Role allocated successfully!');
        setTimeout(() => {
          setSelectedRole('');
          setSelectedFormField('');
          setSuccessMessage('');
        }, 2000);
      } else {
        setErrorMessage('Both role and form field must be selected');
      }
    } catch (error) {
      console.error('Error allocating role:', error);
    }
  };

  const handleDeleteFormField = async () => {
    try {
      if (selectedRole && selectedFormField) {
        await axios.delete(`http://localhost:3000/roles/${selectedRole}/formfields/${selectedFormField}`);
        fetchRoleAllocations();
        setSuccessMessage('Form field allocation deleted successfully!');
        setTimeout(() => {
          setSelectedRole('');
          setSelectedFormField('');
          setSuccessMessage('');
        }, 2000);
      } else {
        setErrorMessage('Both role and form field must be selected');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error deleting form field allocation');
      }
      console.error('Error deleting form field allocation:', error);
      setTimeout(() => {
        setErrorMessage('');
        setSelectedRole('');
        setSelectedFormField('');
        fetchRoles();
        fetchFormFields();
        fetchRoleAllocations();
      }, 2000);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Form Allocation</h2>
      <div className="mb-3">
        <label htmlFor="roleSelect" className="form-label">Select Role:</label>
        <select
          id="roleSelect"
          className="form-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>{role.role}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="formFieldSelect" className="form-label">Select Form Field:</label>
        <select
          id="formFieldSelect"
          className="form-select"
          value={selectedFormField}
          onChange={(e) => setSelectedFormField(e.target.value)}
        >
          <option value="">Select Form Field</option>
          {formFields.map((field) => (
            <option key={field._id} value={field._id}>{field.label}</option>
          ))}
        </select>
      </div>
      <div>
        <button className="btn btn-primary mb-2 me-2" onClick={handleRoleAllocation}>Allocate Role</button>
        <button className="btn btn-danger mb-2" onClick={handleDeleteFormField}>Delete Form Field Allocation</button>
      </div>
      {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
      <h3>All Allocations</h3>
      <ul className="list-group">
        {roleAllocations.map((allocation, index) => (
          <li key={index} className="list-group-item">
            <strong>Role:</strong> {allocation.roleName}
            <ul>
              {allocation.formFields.map((field, fieldIndex) => (
                <li key={fieldIndex}>
                  <strong>Field:</strong> {field.label} ({field.fieldName})
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoleAllocation;
