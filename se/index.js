require("dotenv").config();
const express = require("express");
const connectDb = require("./utils/db");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const UsersModel = require("./models/Users");
const RoleModel = require("./models/Roles");
const FormDataModel = require("./models/FormData");
const FormFieldModel = require("./models/Forms");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../se/middlewares/authMiddleware");
const adminMiddleware = require("./middlewares/adminMiddleware");
const app = express();
const nodemailer = require("nodemailer");
const CryptoJS = require("crypto-js");
const bodyParser = require("body-parser");
const TaskModel = require("./models/TaskToUser");
const Team = require("./models/Team");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "patilnakul300@gmail.com",
    pass: "prvk zmlo twkd tjik",
  },
  debug: true,
});
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: "patilnakul300@gmail.com",
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Return numeric OTP
};

const hashPassword = (data) => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex); // Hash as string
};

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = generateOTP();
    const hashedOTP = hashPassword(otp.toString()); // Hash OTP as a string
    user.otp = hashedOTP;
    await user.save();

    const mailOptions = {
      from: "patilnakul300@gmail.com",
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP for resetting password is ${otp}`,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email: ", error);
        return res.status(500).json({ message: "Error sending OTP" });
      }
      return res.status(200).json({ message: "OTP sent successfully" });
    });
  } catch (error) {
    console.error("Error in forgot password: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedOTP = hashPassword(otp);
    if (user.otp !== hashedOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    // Hash the new password before updating the user document
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the number of salt rounds
    user.password = hashedPassword;
    user.otp = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset password: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route for handling user registration
app.post("/register", async (req, res) => {
  try {
    // Check if the email already exists in the database
    const existingUser = await UsersModel.findOne({ email: req.body.email });
    if (existingUser) {
      // If email already exists, return an error response
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create a new user with the hashed password
    const newUser = await UsersModel.create({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      position: req.body.position,
      joinDate: req.body.joinDate,
      endDate: req.body.endDate,
      skillSet: req.body.skills,
      password: hashedPassword, // Save the hashed password
    });

    // Generate JWT token
    // const token = await newUser.generateToken();

    await newUser.save();
    res.status(201).json({
      msg: "User created successfully",
      // token: token,
      userId: newUser._id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for handling user login
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await UsersModel.findOne({ email: email });

//     if (user) {
//       // If user exists, compare passwords using bcrypt.compare()
//       const passwordMatch = await bcrypt.compare(password, user.password);

//       if (passwordMatch) {
//         // Passwords match, generate a JWT token
//         const token = await user.generateToken();

//         // Extract the role property from the user object
//         const { role } = user;

//         // Fetch role details from the database
//         const roles = await RoleModel.findOne({ role });

//         if (!roles) {
//           return res.status(404).json({ message: "Role not found" });
//         }

//         // Fetch form fields based on the user's role
//         const formFields = await FormFieldModel.find({
//           _id: { $in: roles.formFields },
//         });

//         return res.status(200).json({
//           msg: "Login successful",
//           token: token,
//           userId: user._id.toString(),
//           role: role,
//           formFields: formFields,
//         });
//       } else {
//         // Passwords don't match
//         return res.status(401).json({ message: "Incorrect password" });
//       }
//     } else {
//       // User not found
//       return res.status(404).json({ message: "User not found" });
//     }
//   } catch (err) {
//     // If an error occurs during the process, return an error response
//     console.error("Login error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await UsersModel.findOne({ email }).populate("roles");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has at least one role
    if (user.roles.length === 0) {
      return res
        .status(400)
        .json({ message: "User must have at least one role" });
    }

    // Compare passwords using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate a JWT token
    const token = await user.generateToken();

    // Fetch role details from the database
    const roles = await RoleModel.find({ _id: { $in: user.roles } });

    if (roles.length === 0) {
      return res.status(404).json({ message: "Roles not found" });
    }

    // // Fetch form fields based on the user's roles
    // const roleFormFields = await Promise.all(
    //   roles.map(role => FormFieldModel.find({ _id: { $in: role.formFields } }))
    // );

    // // Flatten the array of form fields (in case there are multiple roles)
    // const formFields = roleFormFields.flat();

    return res.status(200).json({
      msg: "Login successful",
      token: token,
      userId: user._id.toString(),
      roles: roles.map((role) => ({
        id: role._id,
        name: role.role,
      })), // Include role names
      // formFields: formFields,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Endpoint for superadmin login
app.post("/superadmin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.findOne({ email: email });

    if (!isValidEmail(email)) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (user) {
      // If user exists, compare passwords using bcrypt.compare()
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Passwords match, generate a JWT token
        const token = await user.generateToken();
        return res.status(200).json({
          msg: "Login successful",
          token: token,
          userId: user._id.toString(),
        });
      } else {
        // Passwords don't match
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      // User not found
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    // If an error occurs during the process, return an error response
    return res.status(500).json({ message: "Internal server error" });
  }
});

function isValidEmail(email) {
  const allowedDomain = "patilrushikesh.walsystems@gmail.com";
  const domain = email;
  return domain === allowedDomain;
}

//Endpoint to fetch all users from user's schema
app.get("/users", async (req, res) => {
  try {
    //Fetch all users from the database
    const users = await UsersModel.find();

    //Send the user data as a response
    res.status(200).json(users);
  } catch (error) {
    console.log("Error while fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/usersforadmin", async (req, res) => {
  const { name } = req.query;
  try {
    if (name) {
      const users = await UsersModel.find({ name: new RegExp(name, "i") }); // Case-insensitive search
      res.json(users);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});
app.get("/roles", async (req, res) => {
  try {
    // Fetch all roles from the Role collection
    const roles = await RoleModel.find();
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/roles", async (req, res) => {
  try {
    const { role } = req.body;
    // Check if the role already exists
    const existingRole = await RoleModel.findOne({ role });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }
    // Create a new role
    await RoleModel.create({ role });
    res.status(201).json({ message: "Role added successfully" });
  } catch (error) {
    console.error("Error adding role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Assign roles to a user
app.put("/assign-roles/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    // Validate roles
    const validRoles = await RoleModel.find({ _id: { $in: roles } });
    if (validRoles.length !== roles.length) {
      return res.status(400).json({ message: "Some roles are invalid" });
    }

    // Update user's roles
    const updatedUser = await UsersModel.findByIdAndUpdate(
      userId,
      { roles },
      { new: true }
    ).populate("roles"); // Populate roles to get role details

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Roles assigned successfully", user: updatedUser });
  } catch (error) {
    console.error("Error assigning roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for fetching all admins
app.get("/admins", async (req, res) => {
  try {
    // Find all users with isAdmin set to true
    const admins = await UsersModel.find({ isAdmin: true });
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Remove admin
app.put("/remove-admin/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    // Update user's isAdmin status to false
    await UsersModel.findByIdAndUpdate(userId, { isAdmin: false });
    res.status(200).json({ message: "Admin status removed successfully" });
  } catch (error) {
    console.error("Error removing admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Promote to admin
app.put("/admins/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    // Update user's isAdmin status to true
    await UsersModel.findByIdAndUpdate(userId, { isAdmin: true });
    res.status(200).json({ message: "User promoted to admin successfully" });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for fetching form fields
app.get("/formfields", async (req, res) => {
  try {
    // Fetch all form fields from the FormFieldModel collection
    const formFields = await FormFieldModel.find();
    res.status(200).json(formFields);
  } catch (error) {
    console.error("Error fetching form fields:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for adding a new form field
app.post("/formfields", async (req, res) => {
  try {
    const { fieldName, label, type, required, options, group } = req.body;

    // Create a new form field
    await FormFieldModel.create({
      fieldName,
      label,
      type,
      required,
      options,
      group,
    });
    res.status(201).json({ message: "Form field added successfully" });
  } catch (error) {
    console.error("Error adding form field:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for updating an existing form field
app.put("/formfields/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldName, label, type, required, options } = req.body;

    // Find the form field by ID and update its details
    const updatedField = await FormFieldModel.findByIdAndUpdate(
      id,
      { fieldName, label, type, required, options },
      { new: true } // Return the updated form field object
    );

    if (!updatedField) {
      return res.status(404).json({ message: "Form field not found" });
    }

    res.status(200).json({
      message: "Form field updated successfully",
      field: updatedField,
    });
  } catch (error) {
    console.error("Error updating form field:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for deleting an existing form field
app.delete("/formfields/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the form field by ID and delete it
    const deletedField = await FormFieldModel.findByIdAndDelete(id);

    if (!deletedField) {
      return res.status(404).json({ message: "Form field not found" });
    }

    res.status(200).json({ message: "Form field deleted successfully" });
  } catch (error) {
    console.error("Error deleting form field:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for assigning form fields to roles
app.post("/assignformfields", async (req, res) => {
  try {
    const { roleId, formField } = req.body;
    console.log("Received Role:", roleId);
    console.log("Received Form Field:", formField);

    // Find the role by ID
    const role = await RoleModel.findById(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if the form field already exists in the role's formFields array
    const existingFormField = role.formFields.find((field) =>
      field.equals(formField)
    );
    if (existingFormField) {
      return res
        .status(400)
        .json({ message: "Form field already assigned to role" });
    }

    // Assign the form field to the role and save the role
    role.formFields.push(formField);
    await role.save();

    res
      .status(201)
      .json({ message: "Form field assigned to role successfully", role });
  } catch (error) {
    console.error("Error assigning form field to role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Endpoint to fetch all the role allocations
app.get("/roleallocations", async (req, res) => {
  try {
    const roles = await RoleModel.find().populate("formFields").exec();
    const formattedAllocations = roles.map((role) => ({
      roleName: role.role,
      formFields: role.formFields.map((field) => ({
        fieldName: field.fieldName,
        label: field.label,
      })),
    }));
    res.status(200).json(formattedAllocations);
  } catch (error) {
    console.error("Error fetching role allocations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Deleting a form field allocation from a role
app.delete("/roles/:roleId/formfields/:formFieldId", async (req, res) => {
  try {
    const { roleId, formFieldId } = req.params;

    // Find the role by ID
    const role = await RoleModel.findById(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if the form field exists in the role's formFields array
    const fieldIndex = role.formFields.indexOf(formFieldId);
    if (fieldIndex === -1) {
      return res
        .status(400)
        .json({ message: "Form field not allocated to this role" });
    }

    // Remove the form field from the role's formFields array
    role.formFields.splice(fieldIndex, 1);
    await role.save();

    res
      .status(200)
      .json({ message: "Form field allocation deleted successfully" });
  } catch (error) {
    console.error("Error deleting form field allocation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// to display user information
app.get("/user", authMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(`error from the user route ${error}`);
  }
});

app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    // Find tasks assigned to the logged-in user based on their email
    const tasks = await TaskModel.find({ assignedTo: req.userID });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ error: "Failed to update task status" });
  }
});
//ADMIN
//GET all Users to Admin panel

app.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allusers = await UsersModel.find({}, { password: 0 }).populate(
      "roles",
      "role"
    );
    if (!allusers || allusers.length === 0) {
      return res.status(404).json({ msg: "no user found" });
    }
    return res.status(200).json(allusers);
  } catch (error) {
    console.error("no data found from database");
  }
});
app.get(
  "/admin/taskToUser",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const allusers = await UsersModel.find({}, { password: 0 });
      if (!allusers || allusers.length === 0) {
        return res.status(404).json({ msg: "no user found" });
      }
      return res.status(200).json(allusers);
    } catch (error) {
      console.error("no data found from database");
    }
  }
);

// GET endpoint to fetch assigned tasks
app.get("/admin/tasks", async (req, res) => {
  try {
    // Fetch assigned tasks and populate the 'assignedTo' field with user names
    const assignedTasks = await TaskModel.find().populate("assignedTo", "name");
    res.status(200).json(assignedTasks);
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete(
  "/admin/tasks/delete/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;
      await TaskModel.deleteOne({ _id: id });
      return res.status(200).json({ msg: "user deleted sucessfully" });
    } catch (error) {
      console.log(error);
    }
  }
);

// delete user by id in admin panel

app.delete(
  "/admin/users/delete/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;
      await UsersModel.deleteOne({ _id: id });
      return res.status(200).json({ msg: "user deleted sucessfully" });
    } catch (error) {
      console.log(error);
    }
  }
);

// edit user by id in admin panel
app.put(
  "/admin/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const userId = req.params.id;
    const userDataUpdate = req.body;
    try {
      const userUpdate = await UsersModel.findByIdAndUpdate(
        userId,
        userDataUpdate,
        { new: true }
      );
      if (!userUpdate) {
        return res.status(404).json({ msg: "User not found" });
      }
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user in database:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.post("/assignTask", authMiddleware, adminMiddleware, async (req, res) => {
  const { userIds, task, description, completeWithIn, deadline, projectname } =
    req.body;

  // Validate incoming data
  if (
    !userIds ||
    !Array.isArray(userIds) ||
    userIds.length === 0 ||
    !task ||
    !description ||
    !completeWithIn ||
    !deadline
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const assignedUsers = await UsersModel.find({ _id: { $in: userIds } });
    if (assignedUsers.length !== userIds.length) {
      return res
        .status(404)
        .json({ error: "One or more assigned users not found" });
    }

    const assigningUser = await UsersModel.findById(req.user._id);
    if (!assigningUser) {
      return res.status(404).json({ error: "Assigning user not found" });
    }

    const emailList = assignedUsers.map((user) => user.email);
    const userIdsList = assignedUsers.map((user) => user._id);

    await TaskModel.create({
      assignedBy: assigningUser._id,
      assignedByName: assigningUser.name,
      assignedTo: userIdsList,
      emailTo: emailList,
      task: task,
      projectname: projectname,
      description: description,
      completeWithIn: completeWithIn,
      deadline: new Date(deadline),
    });

    res.status(201).json({ message: "Task assigned successfully" });

    const emailSubject = "New Task Assigned";
    const emailText = `I hope this message finds you well.

I am writing to inform you of a new task assignment. Below are the details of the task:

Task: ${task}
Deadline: ${new Date(deadline).toLocaleString()}.

Please ensure that the task is completed by the specified deadline. Should you have any questions or require further clarification regarding this assignment, feel free to reach out.

Thank you for your prompt attention to this matter.

Best regards,`;

    // Send email to all assigned users in parallel
    await Promise.all(
      emailList.map((email) => sendEmail(email, emailSubject, emailText))
    );
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// POST API to create a task for multiple users
// app.post('/tasks',  async (req, res) => {
//   const { task, userIds } = req.body;

//   if (!task || !userIds || !Array.isArray(userIds)) {
//     return res.status(400).json({ error: 'Invalid input' });
//   }

//   try {
//     const taskDoc = new TaskModel({
//       task,
//       assignedTo: userIds,
//     });

//     await taskDoc.save();

//     res.status(201).json({ message: 'Task created successfully', task: taskDoc });
//   } catch (error) {
//     console.error('Error creating task:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
//tasks archive / unarchive
app.patch("/admin/tasks/archive/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body; // Expecting the 'archived' field in the request body

    if (typeof archived !== "boolean") {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const updatedUser = await TaskModel.findByIdAndUpdate(
      id,
      { archived },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// // Endpoint to update noteReply

// app.post('/admin/tasks/:taskId/noteReplySubmit', async (req, res) => {
//   const { taskId } = req.params;
//   const { noteReply } = req.body;

//   if (!noteReply) {
//     return res.status(400).json({ message: 'Note reply is required' });
//   }

//   try {
//     const task = await TaskModel.findById(taskId);

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     task.noteReply = noteReply;
//     await task.save();

//     res.status(200).json({ message: 'Note reply updated successfully', task });
//   } catch (error) {
//     console.error('Error updating note reply:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

//archive users / unarchive users
app.patch("/admin/users/archive/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body; // Expecting the 'archived' field in the request body

    if (typeof archived !== "boolean") {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const updatedUser = await UsersModel.findByIdAndUpdate(
      id,
      { archived },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put(
  "/admin/tasks/updatePriority/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const taskId = req.params.id;
    const { priority } = req.body;

    try {
      const task = await TaskModel.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      task.priority = priority;
      await task.save();

      res.status(200).json({ message: "Priority updated successfully", task });
    } catch (error) {
      console.error("Error updating task priority:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Endpoint to handle task completion note submission
// app.post("/tasks/:taskId/complete", async (req, res) => {
//   const { taskId } = req.params;
//   const { note } = req.body;

//   try {
//     const task = await TaskModel.findById(taskId);
//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     task.completionNote = note;
//     task.status = "Completed/Not Validated"; // Optionally update the task status
//     await task.save();

//     res.json({ message: "Task completion noted successfully", task });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
app.post(
  "/tasks/:id/complete",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const taskId = req.params.id;
      const { note } = req.body;
      const images = req.files.map((file) => file.path);

      const updatedTask = await TaskModel.findByIdAndUpdate(
        taskId,
        { completionNote: note, images },
        { new: true }
      );

      res.json(updatedTask);
    } catch (err) {
      console.error("Error completing task:", err);
      res.status(500).json({ error: "Failed to complete task" });
    }
  }
);

app.put("/admin/tasks/:id/validationStatus", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { validationStatus } = req.body;

    // Optional: Validate the validationStatus value
    const validStatuses = ["validation pending", "validated", "rejected"];
    if (!validStatuses.includes(validationStatus)) {
      return res.status(400).send("Invalid validation status");
    }

    const task = await TaskModel.findByIdAndUpdate(
      taskId,
      { validationStatus },
      { new: true }
    );

    if (!task) {
      return res.status(404).send("Task not found");
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error updating task validation status:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route to update noteReply
app.post("/task/note/:id/reply", async (req, res) => {
  const taskId = req.params.id;
  const { noteReply } = req.body; // assuming `repliedBy` is coming from the request body

  try {
    // Find the task by ID and push a new noteReply object into the noteReplies array
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        $push: {
          noteReplies: {
            reply: noteReply,
            
            repliedAt: new Date(),
          },
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedTask) {
      return res.status(404).send("Task not found");
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// Endpoint to handle task completion note submission
app.post("/tasks/:taskId/note", async (req, res) => {
  const { taskId } = req.params;
  const { note } = req.body;

  try {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Push the new note into the notes array
    task.note.push({ note });

    await task.save();

    res.json({ message: "Note added successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put(
  "/uploadProfile/:id/profileImage",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : "";

      const user = await UsersModel.findByIdAndUpdate(
        id,
        { profileImage: profileImageUrl },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

app.post("/submit-form", upload.single("photo"), async (req, res) => {
  try {
    const { role } = req.body;
    const formData = { ...req.body };
    if (req.file) {
      formData.photo = req.file.path; // Store the file path in the form data
    }

    function convertToIST(date) {
      const istOffset = -6.5 * 60 * 60 * 1000; // IST offset in milliseconds
      return new Date(date.getTime() + istOffset);
    }

    // Get the current UTC time
    const utcDate = new Date();
    console.log(utcDate);

    // Convert UTC to IST
    const istDate = convertToIST(utcDate);
    console.log(istDate);

    const newRole = new FormDataModel({
      role,
      formData,
      submitedAt: istDate,
    });
    await newRole.save();

    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Failed to submit form. Please try again." });
  }
});

app.get("/admin/rolesFormData", async (req, res) => {
  try {
    // Retrieve all submitted form data from the database
    const formData = await FormDataModel.find();

    function convertToIST(date) {
      const istOffset = 6.5 * 60 * 60 * 1000; // IST offset in milliseconds

      return new Date(date.getTime() + istOffset);
    }

    // Convert UTC timestamps to IST
    const submittedFormsIST = formData.map((data) => ({
      ...data.toObject(), // Convert Mongoose document to plain JavaScript object
      submitedAt: convertToIST(data.submitedAt), // Assuming 'submitedAt' is the timestamp field
    }));

    res.status(200).json(submittedFormsIST); // Send response with form data converted to IST
  } catch (error) {
    console.error("Error fetching submitted form data:", error);
    res.status(500).json({ error: "Failed to fetch submitted form data" });
  }
});

app.post("/createTeam", async (req, res) => {
  const { userIds, teamName } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0 || !teamName) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Verify if all user IDs are valid
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({ error: "Some user IDs are invalid." });
    }

    // Create a new team
    const newTeam = new Team({
      name: teamName,
      members: userIds,
      createdAt: new Date(),
    });

    await newTeam.save();

    res.status(201).json({ message: "Team created successfully." });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Failed to create team." });
  }
});


app.put('/updateProfile/:userId', async (req, res) => {
  try {
    const { name, email, mobile, position, joinDate, skillSet } = req.body;

    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      { name, email, mobile, position, joinDate, skillSet: skillSet.split(',').map(skill => skill.trim()) },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Server error');
  }
});


const PORT = 3000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`server is runninig at Port: ${PORT}`);
  });
});
