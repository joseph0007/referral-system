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
  //if you specify an array or object it will show up in your find() query even if it is empty but if its not a data structure
  //and just a datatype(eg: String, Number) then it will not show up if its empty!!
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please fill in your password'],
    minlength: 8,
    //if set to false will not display or return this field of document when getting this document!!
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password'],
    //this only works when we create a new document and not when we update because 'this' points to the newly created document object
    //only when a new document is created!!  i.e when create() or save()
    //the validator function should always return a true/false value!!
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Confirm password does not match the password!',
    },
  },
  changedAt: {
    type: Date,
  },
  resetToken: String,
  tokenExpiry: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //only when password is modified and not to perform when other fields are modified!!
  if (!this.isModified('password')) return next();

  //using the bcrypt with a cost of 12 (the higher the cost the more CPU intensive the crypto process will be)
  this.password = await bcrypt.hash(this.password, 12);

  //setting the confirmPassword field to undefined because we only need it to check the match and not the data to be persistent!!
  this.confirmPassword = undefined;
  next();
});

//middleware for changing "changedAt" property during resetpassword
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && !this.isNew) {
    //deducting a second so that the issuedat time of JWT token is not less than the changedAt time!!because it will then
    //wont permit the user to login!!
    this.changedAt = Date.now() - 1000;
  }

  next();
});

//QUERY MIDDLEWARE
//to not show users that are inactive(deleted) when querying to find documents!!
userSchema.pre(/^find/, async function (next) {
  //we can set additional filter object properties on the object using the query middleware by calling the query on
  //the "this" keyword which in this context points to the current document!
  this.find({ active: { $ne: false } });
  next();
});

//INSTANCE METHODS
/**
 * instance methods are the methods that are available on all the documents of a collection. these methods can be called on any
 * document object returned after querying!!!
 * "this" in this method points to the current document object!
 */
userSchema.methods.isCorrectPassword = async function (
  candidatePass,
  userPassword
) {
  //this points to current document object!!
  return await bcrypt.compare(candidatePass, userPassword);
};

//method to check if the password was changed after the JWT token issue!!
userSchema.methods.isPasswordChangedAfter = function (tokenIssuedTime) {
  if (this.changedAt) {
    const changedAtTime = this.changedAt.getTime() / 1000;

    return changedAtTime > tokenIssuedTime;
  }

  //return false if there is no changedAt property in the document which means the password has not been changed!!
  return false;
};

//method to generate a random token and send to the user and save it the database
userSchema.methods.getPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  //encrypt token to store in database
  //the digest() is to convert the octet format hash generated into hexadecimal format since javascript uses octects as Buffer!!
  this.resetToken = crypto.createHash('sha256').update(token).digest('hex');

  //set an expiry time for the token to expire
  this.tokenExpiry = Date.now() + 10 * 60 * 1000;

  //return the unencrypted token
  return token;
};

const User = mongoose.model('users', userSchema);

module.exports = User;
