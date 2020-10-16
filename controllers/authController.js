const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Handling errors
const handleErrors = (err) => {
  let errors = {email: '', password: ''}
  console.log(err.message);

  // Incorrect password
  if(err.message === 'Incorrect Email'){
    errors.email = 'Incorrect Email';
  }
  if(err.message === 'Incorrect Password'){
    errors.password = 'Incorrect Password';
  }

  // Email duplicado
  if(err.code === 11000){
    errors.email = 'Email already exists';
    return errors;
  }
  // Erro de validação
  if(err.message.includes('user validation failed')){
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message
    })
  }
  return errors;
}

// Criar Token
const maxAge = 60*60*24*3; // 3 dias
const createToken = (id) => {
  return jwt.sign({id}, 'net ninja secret', {expiresIn: maxAge}); // aqui em segundos
}

exports.signup_get = (req, res) => {
  res.render('signup');
}

exports.login_get = (req, res) => {
  res.render('login');
}

exports.signup_post = async (req, res) => {
  const {email , password } = req.body;
  try{
    const user = await User.create({email, password});
    const token = createToken(user._id)
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000}); // 3 dias - aqui em milisegundos
    res.status(201).json({user: user._id})
  }catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({errors})
  }
}

exports.login_post = async (req, res) => {
  const {email, password} = req.body;
  try{
    const user = await User.login(email, password);
    const token = createToken(user._id)
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
    res.status(200).json({user: user._id})
  }catch (err){
    const errors = handleErrors(err);
    res.status(400).json({errors});
  }
}

exports.logout_get = (req, res) => {
  //* Não é possível apagar o token pelo servidor, mas trocar por um valor vazio e colocar um tempo muito curto
  res.cookie('jwt', '', {maxAge: 1})
  res.redirect('/');
}
