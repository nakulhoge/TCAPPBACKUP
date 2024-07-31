
const mongoose = require("mongoose");

// Define the Task schema
const taskSchema = new mongoose.Schema({
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  emailTo: {
    type: [String],
    required: true,
  },
  projectname: {
    type: String,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  assignedByName: {
    type: String,
  },
  task: {
    type: String,
  },
  description: {
    type: String,
  },
  deadline: { type: Date },
  completeWithIn: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Not Started", "Incomplete", "WIP", "Completed/Not Validated"],
    default: "Not Started",
  },
  validationStatus: {
    type: String,
    enum: ["validation pending", "validated", "rejected"],
    default: "validation pending",
  },
  completionNote: {
    type: String,
  },
  note: [
    {
      note: String,
      date: { type: Date, default: Date.now },
    },
  ],
  noteReplies: [
    {
      reply: String,
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      repliedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  archived: {
    type: Boolean,
    default: false,
  },
  images: {
    type: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

// Create the Task model
const TaskModel = mongoose.model("Task", taskSchema);

module.exports = TaskModel;
