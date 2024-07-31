import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Forms = () => {
  // State variables
  const [formFields, setFormFields] = useState([])
  const [newField, setNewField] = useState({
    fieldName: '',
    label: '',
    type: 'text',
    required: false,
    options: [],
    group: '',
  })

  // Fetch existing form fields on component mount
  useEffect(() => {
    fetchFormFields()
  }, [])

  // Function to fetch existing form fields
  const fetchFormFields = async () => {
    try {
      const response = await axios.get('http://localhost:3000/formfields')
      setFormFields(response.data)
    } catch (error) {
      console.error('Error fetching form fields:', error)
    }
  }

  // Function to handle form submission for adding a new form field
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3000/formfields', newField)
      fetchFormFields() // Refresh form fields after adding a new one
      setNewField({
        fieldName: '',
        label: '',
        type: 'text',
        required: false,
        options: [],
        group: '',
      })
    } catch (error) {
      console.error('Error adding form field:', error)
    }
  }

  // Function to handle deletion of a form field
  const handleDelete = async (fieldId) => {
    try {
      await axios.delete(`http://localhost:3000/formfields/${fieldId}`)
      fetchFormFields() // Refresh form fields after deletion
    } catch (error) {
      console.error('Error deleting form field:', error)
    }
  }

  return (
    <div className="container">
      <h2 className="mt-5">Manage Form Fields</h2>
      {/* Form for adding a new form field */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Field Name:</label>
          <input
            type="text"
            className="form-control"
            value={newField.fieldName}
            onChange={(e) =>
              setNewField({ ...newField, fieldName: e.target.value })
            }
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Label:</label>
          <input
            type="text"
            className="form-control"
            value={newField.label}
            onChange={(e) =>
              setNewField({ ...newField, label: e.target.value })
            }
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Type:</label>
          <select
            className="form-select"
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="number">Number</option>
            <option value="select">Dropdown</option>
            <option value="file">File</option>

            {/* Add other options for different field types */}
          </select>
        </div>
        {newField.type === 'select' && ( // Render options input field only if type is select
          <div className="mb-3">
            <label className="form-label">Options (Separated by Commas):</label>
            <input
              type="text"
              className="form-control"
              value={newField.options.join(',')}
              onChange={(e) =>
                setNewField({ ...newField, options: e.target.value.split(',') })
              }
            />
          </div>
        )}
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={newField.required}
            onChange={(e) =>
              setNewField({ ...newField, required: e.target.checked })
            }
          />
          <label className="form-check-label">Required</label>
        </div>
        <div className="mb-3">
          <label className="form-label">Group:</label>
          <input
            type="text"
            className="form-control"
            value={newField.group}
            onChange={(e) =>
              setNewField({ ...newField, group: e.target.value })
            }
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add Field
        </button>
      </form>

      {/* List existing form fields */}
      <div>
        <h3 className="mt-5">Existing Form Fields</h3>
        <ul className="list-group">
          {formFields.map((field) => (
            <li key={field._id} className="list-group-item">
              <strong>{field.label}</strong> - {field.type} - Required:{' '}
              {field.required ? 'Yes' : 'No'}
              {field.type === 'select' && (
                <select>
                  {field.options.map((option, index) => (
                    <option key={index}>{option}</option>
                  ))}
                </select>
              )}
              {/* Delete button */}
              <button
                onClick={() => handleDelete(field._id)}
                className="btn btn-danger ms-2"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Forms
