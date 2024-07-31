const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UsersSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: Number,
  password: String,
  position:String,
  joinDate:Date,
  endDate:{
    type:String,
  default: null},
  skillSet:[String],
  isAdmin: {
    type: Boolean,
    default: false,
  },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  profileImage: {
    type: String, // URL of the uploaded image
  },
  otp: {
    type: String,
  },
  archived: { 
    type: Boolean,
    default: false,
  },
});

// jwt token
UsersSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        name: this.name,
        email: this.email,
        isAdmin: this.isAdmin,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const UsersModel = mongoose.model("users", UsersSchema);
module.exports = UsersModel;
