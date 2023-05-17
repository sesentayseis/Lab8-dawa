const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users });
});
/*
router.post('/', async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.redirect('/users');
});*/
router.get('/register', (req, res) => {
  res.render('partials/register', {});
});

router.post('/register', [
  body('name', "Ingrese nombres y apellido completo")
    .exists()
    .isLength({min:5}),
  body('email', "El correo electrónico debe contener un @ y un dominio válido.")
    .exists()
    .isEmail(),
    
  body('password','La longitud de la contraseña debe ser de al menos 8 caracteres.\n' +
  'Debe contener al menos una letra mayúscula.\n' +
  'Debe contener al menos una letra minúscula.\n' +
  'Debe contener al menos un número.\n' +
  'Puede contener caracteres especiales.')
    .exists()
    .isStrongPassword()
    
],async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("llegamos a aqui papu");
    const valores = req.body
    const validaciones = errors.array()
    
    //return res.status(422).json({ errors: errors.array()});
    console.log(req.body)
    res.render('partials/register',{validaciones: errors.array(), valores:valores})
  } else {
    console.log("se agrego exitosamente")
    const { name, email, password } = req.body;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      name,
      email,
      password: passwordHash
    });
    await newUser.save();
    res.redirect('/users');
  }
});
/*
router.post('/',async (req, res) => {
  
    const { name, email, password } = req.body;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      name,
      email,
      password: passwordHash
    });
    await newUser.save();
    res.redirect('/users');
  
});*/


router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});
/*
router.post('/update/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/users');
});*/

router.post('/update/:id', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la nueva contraseña con una sal de 10 vueltas.
  await User.findByIdAndUpdate(req.params.id, { name, email, password: hashedPassword });
  res.redirect('/users');
});


router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});




module.exports = router;
