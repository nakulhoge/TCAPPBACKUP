// models/Role.js
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true,
  },
  formFields: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'forms',
    required: true,
  },
  ]
});

const RoleModel = mongoose.model('Role', RoleSchema)

module.exports = RoleModel;
