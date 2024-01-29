const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    validate: {
      validator: function(name) {
        return /^[A-Za-z\s]+$/.test(name) && name.trim().length > 0;
      },
      message: 'Name must not contain numbers and cannot be just spaces'
    }
  },
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    validate: {
      validator: function(surname) {
        return /^[A-Za-z\s]+$/.test(surname) && surname.trim().length > 0;
      },
      message: 'Surname must not contain numbers and cannot be just spaces'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Invalid email format']
  },
  password: { 
    type: String, 
    required: true 
  },
  admin: { 
    type: Boolean, 
    default: false 
  },
});

userSchema.statics.signup = async function (
  name,
  surname,
  email,
  password,
  admin
) {
  if (!name || !surname || !email || !password) {
    throw Error("You have to properly fill in all the fields");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({
    name,
    surname,
    email,
    password: hash,
    admin: "false",
  });

  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("You have to properly fill in all the fields");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
