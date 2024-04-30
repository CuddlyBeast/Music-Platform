const express = require('express')
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { authenticateUser } = require('../middleware/authenticationMiddleware')

const router = express.Router();

// Sign-up
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const validationOptions = {
      minLength: 8,
      minLowerCase: 1,
      minUpperCase: 1,
      minNumber: 1,
      minSymbols:0,
      returnScore: false,
    };

    if (!validator.isStrongPassword(password, validationOptions)) {
      return res.status(400).json({ error: 'Weak password. Must be at least 8 characters long including lowercase, uppercase, and numeric values.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.json({
      message: 'User successfully registered',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sign-in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id }, 'abzetghkdslpioklds', { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).send({ error: 'Internal Server Error' });
      } else {
        res.status(200).send({ message: "Logout Successful" })
      }
    });
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

  // Profile Data 
  router.get('/user', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findOne({ where: { id: userId } });
      res.status(200).send({ username: user.username, email: user.email });
    } catch (error) {
      res.status(500).send({ error: "Internal Server Error"})
    }
  });

  // Update Profile Data (Not currently necessary)
  router.put('/user', authenticateUser, async (req, res) => {
    try {
      const { username,	email, password } = req.body
      const userId = req.user.id;

      const hashedPassword = await bcrypt.hash(password, 10);

      const [rowsAffected, [updatedUser]] = await User.update({
        username,
        email,
        password: hashedPassword,
      }, {
        where: {
         id: userId 
        },
        returning: true
      })

      if (rowsAffected === 0) {
        return res.status(404).send({ error: "Customer not found" });
      }

      res.send({
        message: "Customer Information Updated!",
        Customer: updatedUser
      })
    } catch (error) {
      res.status(500).send({ error: "Internal Server Error"})
    }
  });



module.exports = router;