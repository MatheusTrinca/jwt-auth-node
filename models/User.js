const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']

  },
  password: {
    type: String,
    required: [true, 'Please enter an password'],
    minlength: [6, 'Minimum password length is 6 characters']
  }
});


//! Se deixar com arrow function, o this não referenciará o objeto local -> lá no authController
userSchema.pre('save', async function(next){
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({email});
  if(user){
    const auth = await bcrypt.compare(password, user.password);
    if(auth){
      return user;
    }
    throw Error('Incorrect Password')
  }
  throw Error('Incorrect Email')
}

          // userSchema.post('save', function(doc, next) {
          //   console.log('User created', doc);
          //   next();
          // })

const User = mongoose.model('user', userSchema);
module.exports = User;

