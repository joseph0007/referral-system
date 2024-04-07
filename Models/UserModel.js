const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { default: validator } = require('validator');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user should have a name'],
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'please fill in your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    select: false,
    validate: {
      validator: function (val) {
        let isValid = false;

        console.log("this.isOAuth ", this.isOAuth);
        if( this.isOAuth === true ) {
          isValid = true;
          this.password = undefined;
        } else if( typeof val === 'string' && val.length > 8 ) {
          isValid = true;
        }

        console.log("this.password ", this.password);

        return isValid;
      },
      message: 'Make sure your password is more than 8 characters!',
    },
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (val) {
        if( this.isOAuth === true ) {
          return true;
        }

        return val === this.password;
      },
      message: 'Confirm password does not match the password!',
    },
  },
  isOAuth: {
    type: Boolean,
  },
  isWalletLinked: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
  },
  changedAt: {
    type: Date,
  },
  changedBy: {
    type: mongoose.Types.ObjectId,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  this.confirmPassword = undefined;

  if (!this.isModified('password')) return next();

  if( this.isOAuth === true ) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre('save', async function (next) {
  if( this.isOAuth === true ) return next();

  if (this.isModified('password') && !this.isNew) {
    this.changedAt = Date.now() - 1000;
  }

  next();
});

userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.isCorrectPassword = async function (
  candidatePass,
  userPassword
) {
  if( !userPassword ) return false;
  
  return await bcrypt.compare(candidatePass, userPassword);
};

userSchema.methods.isPasswordChangedAfter = function (tokenIssuedTime) {
  if (this.changedAt) {
    const changedAtTime = this.changedAt.getTime() / 1000;

    return changedAtTime > tokenIssuedTime;
  }

  return false;
};

const User = mongoose.model('users', userSchema);

module.exports = User;
