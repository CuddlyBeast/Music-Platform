const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateUser = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');


  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Missing token' });
  }

  try {
    const decodedToken = jwt.verify(token, 'abzetghkdslpioklds');
    const user = await User.findByPk(decodedToken.id); 
  

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid user' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

module.exports = { authenticateUser };
